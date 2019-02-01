import BaseAuthenticator from "ember-simple-auth/authenticators/base";
import { computed } from "@ember/object";
import { run } from "@ember/runloop";
import { inject as service } from "@ember/service";
import RSVP from "rsvp";
import Configuration from "ember-simple-auth/configuration";
import config from "ember-simple-auth-oidc/config";

const {
  host,
  tokenEndpoint,
  userinfoEndpoint,
  clientId,
  refreshLeeway,
  authPrefix,
  expiresIn
} = config;

const getUrl = endpoint => `${host}${endpoint}`;

export default BaseAuthenticator.extend({
  ajax: service(),
  router: service(),

  _upcomingRefresh: null,

  redirectUri: computed(function() {
    let { protocol, host } = location;
    let path = this.router.urlFor(Configuration.authenticationRoute);
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

    let data = await this.get("ajax").post(getUrl(tokenEndpoint), {
      responseType: "application/json",
      contentType: "application/x-www-form-urlencoded",
      data: {
        code,
        client_id: clientId,
        grant_type: "authorization_code",
        redirect_uri: this.redirectUri
      }
    });

    return this._handleAuthResponse(data);
  },

  /**
   * Invalidate the current session with the refresh token
   *
   * @return {Promise} The invalidate promise
   */
  async invalidate() {
    return RSVP.resolve(true);
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
      return RSVP.reject("Refresh token is missing");
    }

    if (expireTime && expireTime <= new Date().getTime()) {
      return RSVP.resolve(await this._refresh(refresh_token));
    } else {
      this._scheduleRefresh(expireTime, refresh_token);
      return RSVP.resolve(sessionData);
    }
  },

  /**
   * Refresh the access token
   *
   * @param {String} refresh_token The refresh token
   * @returns {Object} The parsed response data
   */
  async _refresh(refresh_token) {
    let data = await this.get("ajax").post(getUrl(tokenEndpoint), {
      responseType: "application/json",
      contentType: "application/x-www-form-urlencoded",
      data: {
        refresh_token,
        client_id: clientId,
        grant_type: "refresh_token",
        redirect_uri: this.redirectUri
      }
    });

    return this._handleAuthResponse(data);
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
      run.cancel(this._upcomingRefresh);
      this._upcomingRefresh = null;
    }
    this._upcomingRefresh = run.later(
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
    const userinfo = await this.get("ajax").request(getUrl(userinfoEndpoint), {
      headers: { Authorization: `${authPrefix} ${accessToken}` },
      responseType: "application/json"
    });

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
