import { computed } from "@ember/object";
import { later, cancel } from "@ember/runloop";
import { inject as service } from "@ember/service";
import { isServerErrorResponse, isAbortError } from "ember-fetch/errors";
import config from "ember-simple-auth-oidc/config";
import getAbsoluteUrl from "ember-simple-auth-oidc/utils/absoluteUrl";
import BaseAuthenticator from "ember-simple-auth/authenticators/base";
import Configuration from "ember-simple-auth/configuration";
import fetch from "fetch";
import { resolve } from "rsvp";

const {
  host,
  tokenEndpoint,
  userinfoEndpoint,
  clientId,
  refreshLeeway,
  authPrefix,
  expiresIn,
  amountOfRetries,
  retryTimeout
} = config;

const getUrl = endpoint => `${getAbsoluteUrl(host)}${endpoint}`;

export default BaseAuthenticator.extend({
  router: service(),

  _upcomingRefresh: null,

  redirectUri: computed(function() {
    const { protocol, host } = location;
    const path = this.router.urlFor(Configuration.authenticationRoute);
    return `${protocol}//${host}${path}`;
  }),

  /**
   * Authenticate the client with the given authentication code. The
   * authentication call will return an access and refresh token which will
   * then authenticate the client against the API.
   *
   * @param {Object} options The authentication options
   * @param {String} options.code The authentication code
   * @returns {Object} The parsed response data
   */
  async authenticate({ code }) {
    if (!tokenEndpoint || !userinfoEndpoint) {
      throw new Error(
        "Please define all OIDC endpoints (auth, token, userinfo)"
      );
    }

    const body = new URLSearchParams();
    body.append("code", code);
    body.append("client_id", clientId);
    body.append("grant_type", "authorization_code");
    body.append("redirect_uri", this.redirectUri);

    const response = await fetch(getUrl(tokenEndpoint), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body
    });

    const data = await response.json();

    return this._handleAuthResponse(data);
  },

  /**
   * Invalidate the current session with the refresh token
   *
   * @return {Promise} The invalidate promise
   */
  invalidate() {
    return resolve(true);
  },

  /**
   * Restore the session after a page refresh. This will check if an access
   * token exists and tries to refresh said token. If the refresh token is
   * already expired, the auth backend will throw an error which will cause a
   * new login.
   *
   * @param {Object} sessionData The current session data
   * @param {String} sessionData.access_token The raw access token
   * @param {String} sessionData.refresh_token The raw refresh token
   * @returns {Promise} A promise which resolves with the session data
   */
  async restore(sessionData) {
    const { refresh_token, expireTime } = sessionData;

    if (!refresh_token) {
      throw new Error("Refresh token is missing");
    }

    if (expireTime && expireTime <= new Date().getTime()) {
      return await this._refresh(refresh_token);
    }
    this._scheduleRefresh(expireTime, refresh_token);
    return sessionData;
  },

  /**
   * Refresh the access token
   *
   * @param {String} refresh_token The refresh token
   * @returns {Object} The parsed response data
   */
  async _refresh(refresh_token, retryCount = 0) {
    try {
      const body = new URLSearchParams();
      body.append("refresh_token", refresh_token);
      body.append("client_id", clientId);
      body.append("grant_type", "refresh_token");
      body.append("redirect_uri", this.redirectUri);

      const response = await fetch(getUrl(tokenEndpoint), {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body
      });
      if (isServerErrorResponse(response)) throw new Error(response.message);

      const data = await response.json();

      return this._handleAuthResponse(data);
    } catch (e) {
      if (isAbortError(e) && retryCount < amountOfRetries - 1) {
        return new Promise(resolve => {
          later(
            this,
            () => resolve(this._refresh(refresh_token, retryCount + 1)),
            retryTimeout
          );
        });
      }
      throw e;
    }
  },

  /**
   * Schedule a refresh of the access token.
   *
   * This refresh needs to happen before the access token actually expires.
   *
   * @param {Number} expireTime Timestamp in milliseconds at which the access token expires
   * @param {String} token The refresh token
   */
  _scheduleRefresh(expireTime, token) {
    if (expireTime <= new Date().getTime()) {
      return;
    }

    if (this._upcomingRefresh) {
      cancel(this._upcomingRefresh);
      this._upcomingRefresh = null;
    }
    this._upcomingRefresh = later(
      this,
      async token => {
        this.trigger("sessionDataUpdated", await this._refresh(token));
      },
      token,
      expireTime - new Date().getTime()
    );
  },

  /**
   * Request user information from the openid userinfo endpoint
   *
   * @param {String} accessToken The raw access token
   * @returns {Object} Object containing the user information
   */
  async _getUserinfo(accessToken) {
    const response = await fetch(getUrl(userinfoEndpoint), {
      headers: {
        Authorization: `${authPrefix} ${accessToken}`,
        Accept: "application/json"
      }
    });

    const userinfo = await response.json();

    return userinfo;
  },

  /**
   * Handle an auth response. This method parses the token and schedules a
   * token refresh before the received token expires.
   *
   * @param {Object} response The raw response data
   * @param {String} response.access_token The raw access token
   * @param {String} response.refresh_token The raw refresh token
   * @param {Number} response.expires_in Seconds until access_token expires
   * @returns {Object} The authentication data
   */
  async _handleAuthResponse({
    access_token,
    refresh_token,
    expires_in,
    id_token
  }) {
    const userinfo = await this._getUserinfo(access_token);

    const expireInMilliseconds = expires_in ? expires_in * 1000 : expiresIn;
    const expireTime =
      new Date().getTime() + expireInMilliseconds - refreshLeeway;

    this._scheduleRefresh(expireTime, refresh_token);

    return { access_token, refresh_token, userinfo, id_token, expireTime };
  }
});
