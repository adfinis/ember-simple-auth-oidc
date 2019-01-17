import BaseAuthenticator from "ember-simple-auth/authenticators/base";
import { computed } from "@ember/object";
import { later } from "@ember/runloop";
import { inject as service } from "@ember/service";
import Configuration from "ember-simple-auth/configuration";
import { assert } from "@ember/debug";
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
    // eslint-disable-next-line no-unused-vars
    return new Promise(function(resolve, reject) {
      resolve(true);
      // We never reject here
    });
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
   * @returns {Object} The parsed response data
   */
  async restore(sessionData) {
    const { access_token, refresh_token } = sessionData;

    if (!access_token) {
      assert("Token is missing");
    }

    return await this._refresh(refresh_token);
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
   * @param {Number} milliseconds Millilseconds before the access token expires
   * @param {String} token The refresh token
   */
  _scheduleRefresh(milliseconds, token) {
    later(
      this,
      async token => {
        this.trigger("sessionDataUpdated", await this._refresh(token));
      },
      token,
      milliseconds - refreshLeeway
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

    const expireTime = expires_in ? expires_in * 1000 : expiresIn;

    this._scheduleRefresh(expireTime, refresh_token);

    return { access_token, refresh_token, userinfo, id_token };
  }
});
