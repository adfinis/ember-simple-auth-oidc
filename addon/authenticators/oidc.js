import BaseAuthenticator from "ember-simple-auth/authenticators/base";
import { computed } from "@ember/object";
import { later } from "@ember/runloop";
import { inject as service } from "@ember/service";
import Configuration from "ember-simple-auth/configuration";
import { assert } from "@ember/debug";
import config from "ember-simple-auth-oidc/config";

const {
  host,
  realm,
  tokenEndpoint,
  logoutEndpoint,
  clientId,
  refreshLeeway
} = config;

const getUrl = endpoint => `${host}/realms/${realm}${endpoint}`;

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
    let data = await this.ajax.post(getUrl(tokenEndpoint), {
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
   * @param {Object} data The authenticated data
   * @param {String} data.refresh_token The refresh token
   * @return {Promise} The logout request
   */
  async invalidate({ refresh_token }) {
    return await this.ajax.post(getUrl(logoutEndpoint), {
      responseType: "application/json",
      contentType: "application/x-www-form-urlencoded",
      data: {
        refresh_token,
        client_id: clientId
      }
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

    // Prevent a token refresh if the token is not expired.
    if (
      this._timestampToDate(this._parseToken(access_token).exp) < new Date()
    ) {
      return await this._refresh(refresh_token);
    }

    // If the above expression returns false, the restore is not called again and the token is left to die.
    // To prevent this, we schedule another restore when the token is expired.
    later(
      this,
      async () =>
        this.trigger("sessionDataUpdated", await this.restore(sessionData)),
      this._timestampToDate(this._parseToken(access_token).exp) - new Date()
    );

    return sessionData;
  },

  /**
   * Refresh the access token
   *
   * @param {String} refresh_token The refresh token
   * @returns {Object} The parsed response data
   */
  async _refresh(refresh_token) {
    let data = await this.ajax.post(getUrl(tokenEndpoint), {
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
   * @param {*} datetime The datetime at which the access token expires
   * @param {*} token The refresh token
   */
  _scheduleRefresh(datetime, token) {
    later(
      this,
      async token => {
        this.trigger("sessionDataUpdated", await this._refresh(token));
      },
      token,
      datetime - refreshLeeway - new Date()
    );
  },

  /**
   * Convert a unix timestamp to a date object
   *
   * @param {Number} exp The unix timestamp
   * @returns {Date} The date which results out of the timestamp
   */
  _timestampToDate(ts) {
    return new Date(ts);
  },

  /**
   * Parse the body of a bearer token
   *
   * @param {String} token The raw bearer token
   * @returns {Object} The parsed token data
   */
  _parseToken(token) {
    let [, body] = token.split(".");

    return JSON.parse(decodeURIComponent(escape(atob(body))));
  },

  /**
   * Handle an auth response. This method parses the token and schedules a
   * token refresh before the received token expires.
   *
   * @param {Object} response The raw response data
   * @param {String} response.access_token The raw access token
   * @param {String} response.refresh_token The raw refresh token
   * @returns {Object} The authentication data
   */
  _handleAuthResponse({ access_token, refresh_token }) {
    let data = this._parseToken(access_token);

    this._scheduleRefresh(this._timestampToDate(data.exp), refresh_token);

    return { access_token, refresh_token, data };
  }
});
