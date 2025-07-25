import { later } from "@ember/runloop";
import { inject as service } from "@ember/service";
import { lastValue, task } from "ember-concurrency";
import BaseAuthenticator from "ember-simple-auth/authenticators/base";
import { resolve } from "rsvp";
import { TrackedObject } from "tracked-built-ins";

import config from "ember-simple-auth-oidc/config";
import getAbsoluteUrl from "ember-simple-auth-oidc/utils/absolute-url";
import {
  isServerErrorResponse,
  isAbortError,
  isBadRequestResponse,
} from "ember-simple-auth-oidc/utils/errors";

const camelize = (s) => s.replace(/_./g, (x) => x[1].toUpperCase());

const camelizeObjectKeys = (obj) =>
  Object.entries(obj).reduce((newObj, [key, value]) => {
    return (newObj[camelize(key)] = value);
  }, {});

export default class OidcAuthenticator extends BaseAuthenticator {
  @service router;
  @service session;

  @config config;

  get configuration() {
    return { ...this.config, ...this.fetchedConfig };
  }

  get hasEndpointsConfigured() {
    return (
      this.configuration.tokenEndpoint && this.configuration.userinfoEndpoint
    );
  }

  /**
   * Tries to fetch the OIDC provider configuration from the specified host/realm.
   * SPEC: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfig
   */
  @lastValue("_fetchAuthConfiguration") fetchedConfig;
  _fetchAuthConfiguration = task(async () => {
    if (!this.config.host) {
      throw new Error("Please define a OIDC host.");
    }
    const response = await fetch(
      `${this.config.host}/.well-known/openid-configuration`,
    );
    const json = await response.json();

    return camelizeObjectKeys(json.data);
  });

  /**
   * Authenticate the client with the given authentication code. The
   * authentication call will return an access and refresh token which will
   * then authenticate the client against the API.
   *
   * @param {Object} options The authentication options
   * @param {String} options.code The authentication code
   * @returns {Object} The parsed response data
   */
  async authenticate({ code, redirectUri, codeVerifier, isRefresh }) {
    if (!this.hasEndpointsConfigured) {
      await this._fetchAuthConfiguration.perform();

      if (!this.hasEndpointsConfigured) {
        throw new Error(
          "Please define all OIDC endpoints (auth, token, userinfo)",
        );
      }
    }

    if (isRefresh) {
      return await this._refresh(
        this.session.data.authenticated.refresh_token,
        redirectUri,
      );
    }

    const bodyObject = {
      code,
      client_id: this.configuration.clientId,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    };

    if (this.configuration.enablePkce) {
      bodyObject.code_verifier = codeVerifier;
    }

    const body = Object.keys(bodyObject)
      .map((k) => `${k}=${encodeURIComponent(bodyObject[k])}`)
      .join("&");

    const response = await fetch(
      getAbsoluteUrl(this.configuration.tokenEndpoint, this.config.host),
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      },
    );

    const isServerError = isServerErrorResponse(response);
    if (isServerError) throw new Error(response.message);

    const data = await response.json();

    // Failed request
    const isBadRequest = isBadRequestResponse(response);
    if (isBadRequest) throw data;

    // Store the redirect URI in the session for the restore call
    data.redirectUri = redirectUri;

    return this._handleAuthResponse(data);
  }

  /**
   * Invalidate the current ember simple auth session
   *
   * @return {Promise} The invalidate promise
   */
  invalidate() {
    return resolve(true);
  }

  /**
   * Invalidates the current session (of this application) and calls the
   * `end-session` endpoint of the authorization server, which will
   * invalidate all sessions which are handled by the authorization server
   * (possible for multiple applications).
   *
   * @param {String} idToken The id_token of the session to invalidate
   */
  singleLogout(idToken) {
    if (!this.configuration.endSessionEndpoint) {
      return;
    }

    const params = [];

    if (this.configuration.afterLogoutUri) {
      params.push(
        `post_logout_redirect_uri=${getAbsoluteUrl(
          this.configuration.afterLogoutUri,
        )}`,
      );
    }

    if (idToken) {
      params.push(`id_token_hint=${idToken}`);
    }

    this._redirectToUrl(
      `${getAbsoluteUrl(
        this.configuration.endSessionEndpoint,
        this.configuration.host,
      )}?${params.join("&")}`,
    );
  }

  _redirectToUrl(url) {
    location.replace(url);
  }

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
    const { refresh_token, expireTime, redirectUri } = sessionData;

    if (!refresh_token) {
      throw new Error("Refresh token is missing");
    }

    if (expireTime && expireTime <= new Date().getTime()) {
      return await this._refresh(refresh_token, redirectUri);
    }

    return sessionData;
  }

  /**
   * Refresh the access token
   *
   * @param {String} refresh_token The refresh token
   * @returns {Object} The parsed response data
   */
  async _refresh(refresh_token, redirectUri, retryCount = 0) {
    let isServerError = false;
    try {
      const bodyObject = {
        refresh_token,
        client_id: this.configuration.clientId,
        grant_type: "refresh_token",
        redirect_uri: redirectUri,
      };
      const body = Object.keys(bodyObject)
        .map((k) => `${k}=${encodeURIComponent(bodyObject[k])}`)
        .join("&");

      const response = await fetch(
        getAbsoluteUrl(this.configuration.tokenEndpoint, this.config.host),
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body,
        },
      );
      isServerError = isServerErrorResponse(response);
      if (isServerError) throw new Error(response.message);

      const data = await response.json();

      // Failed refresh
      const isBadRequest = isBadRequestResponse(response);
      if (isBadRequest) return Promise.reject(data);

      // Store the redirect URI in the session for the restore call
      data.redirectUri = redirectUri;

      return this._handleAuthResponse(data);
    } catch (e) {
      if (
        (isServerError || isAbortError(e)) &&
        retryCount < this.configuration.amountOfRetries - 1
      ) {
        return new Promise((resolve) => {
          later(
            this,
            () =>
              resolve(
                this._refresh(refresh_token, redirectUri, retryCount + 1),
              ),
            this.configuration.retryTimeout,
          );
        });
      }
      throw e;
    }
  }

  /**
   * Request user information from the openid userinfo endpoint
   *
   * @param {String} accessToken The raw access token
   * @returns {Object} Object containing the user information
   */
  async _getUserinfo(accessToken) {
    const response = await fetch(
      getAbsoluteUrl(this.configuration.userinfoEndpoint, this.config.host),
      {
        headers: {
          Authorization: `${this.configuration.authPrefix} ${accessToken}`,
          Accept: "application/json",
        },
      },
    );

    const userinfo = await response.json();

    return userinfo;
  }

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
    id_token,
    redirectUri,
  }) {
    const userinfo = await this._getUserinfo(access_token);

    const expireInMilliseconds = expires_in
      ? expires_in * 1000
      : this.configuration.expiresIn;
    const expireTime =
      new Date().getTime() +
      expireInMilliseconds -
      this.configuration.refreshLeeway;

    return new TrackedObject({
      access_token,
      refresh_token,
      userinfo,
      id_token,
      expireTime,
      redirectUri,
    });
  }
}
