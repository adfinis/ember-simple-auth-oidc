import { debug } from "@ember/debug";
import { cancel, later } from "@ember/runloop";
import { service } from "@ember/service";
import { waitForFetch } from "@ember/test-waiters";
import BaseAuthenticator from "ember-simple-auth/authenticators/base";
import { resolve } from "rsvp";
import { TrackedObject } from "tracked-built-ins";

import getAbsoluteUrl from "ember-simple-auth-oidc/utils/absolute-url";
import {
  isServerErrorResponse,
  isAbortError,
  isBadRequestResponse,
} from "ember-simple-auth-oidc/utils/errors";

const REFRESH_JITTER_FALLBACK_MS = 15000;

export default class OidcAuthenticator extends BaseAuthenticator {
  @service router;
  @service session;
  @service("esa-oidc-config") config;

  /**
   * Authenticate the client with the given authentication code. The
   * authentication call will return an access and refresh token which will
   * then authenticate the client against the API.
   *
   * @param {Object} options The authentication options
   * @param {String} options.code The authentication code
   * @returns {Object} The parsed response data
   */
  async authenticate(options) {
    if (!this.config.hasEndpointsConfigured) {
      throw new Error(
        "Please define all OIDC endpoints (auth, token, userinfo)",
      );
    }

    const { isRefresh = false, redirectUri, customParams = {} } = options;

    if (isRefresh) {
      const DEFAULT_RETRY_COUNT = 0;
      return await this._refresh(
        this.session.data.authenticated.refresh_token,
        redirectUri,
        DEFAULT_RETRY_COUNT,
        customParams,
      );
    }

    const body = this._buildBodyQuery(options);

    const response = await waitForFetch(
      fetch(getAbsoluteUrl(this.config.tokenEndpoint, this.config.host), {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      }),
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
    if (this._upcomingRefresh) {
      cancel(this._upcomingRefresh);
      this._upcomingRefresh = null;
    }
    this._refreshGeneration = (this._refreshGeneration || 0) + 1;
    // Clear in-flight dedup state so a stale resolved/rejected promise is
    // never returned to a caller after the session has been invalidated.
    this._inflightRefresh = null;
    this._inflightRefreshToken = null;
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
    if (!this.config.endSessionEndpoint) {
      return;
    }

    const params = [];

    if (this.config.afterLogoutUri) {
      params.push(
        `post_logout_redirect_uri=${getAbsoluteUrl(
          this.config.afterLogoutUri,
        )}`,
      );
    }

    if (idToken) {
      params.push(`id_token_hint=${idToken}`);
    }

    this._redirectToUrl(
      `${getAbsoluteUrl(
        this.config.endSessionEndpoint,
        this.config.host,
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
    const { refresh_token, access_token, expireTime, redirectUri } =
      sessionData;

    if (!refresh_token) {
      throw new Error("Refresh token is missing");
    }

    // Stash refresh_token so _handleAuthResponse can recover it if the
    // provider doesn't return one in the refresh response.
    this._lastRefreshToken = refresh_token;

    const needsRefresh =
      !access_token || !expireTime || expireTime <= new Date().getTime();
    if (needsRefresh) {
      return await this._refresh(refresh_token, redirectUri);
    }

    this._scheduleRefresh(expireTime, refresh_token, redirectUri);
    return sessionData;
  }

  /**
   * Refresh the access token
   *
   * @param {String} refresh_token The refresh token
   * @returns {Object} The parsed response data
   */
  async _refresh(
    refresh_token,
    redirectUri,
    retryCount = 0,
    customParams = {},
  ) {
    // Deduplicate concurrent refresh calls within the same tab.  If a refresh
    // is already in-flight for the same token, return the existing promise
    // instead of firing a second request that would race at the OIDC provider.
    if (this._inflightRefresh && this._inflightRefreshToken === refresh_token) {
      return this._inflightRefresh;
    }

    this._inflightRefreshToken = refresh_token;
    this._inflightRefresh = this.__doRefresh(
      refresh_token,
      redirectUri,
      retryCount,
      customParams,
    ).finally(() => {
      this._inflightRefresh = null;
      this._inflightRefreshToken = null;
    });

    return this._inflightRefresh;
  }

  async __doRefresh(
    refresh_token,
    redirectUri,
    retryCount = 0,
    customParams = {},
  ) {
    let isServerError = false;
    try {
      const body = this._buildBodyQuery({
        redirectUri,
        refresh_token,
        isRefresh: true,
        customParams,
      });

      const response = await waitForFetch(
        fetch(getAbsoluteUrl(this.config.tokenEndpoint, this.config.host), {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body,
        }),
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
        retryCount < this.config.amountOfRetries - 1
      ) {
        return new Promise((resolve) => {
          later(
            this,
            () =>
              resolve(
                this._refresh(refresh_token, redirectUri, retryCount + 1),
              ),
            this.config.retryTimeout,
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
    const response = await waitForFetch(
      fetch(getAbsoluteUrl(this.config.userinfoEndpoint, this.config.host), {
        headers: {
          Authorization: `${this.config.authPrefix} ${accessToken}`,
          Accept: "application/json",
        },
      }),
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
    // Some OIDC providers don't return refresh_token on refresh responses.
    // Preserve the existing one to prevent session corruption.
    if (!refresh_token) {
      refresh_token = this._lastRefreshToken;
    }
    if (!refresh_token) {
      throw new Error(
        "refresh_token is missing from the token response and could not be " +
          "recovered. The session will be unable to refresh on next restore.",
      );
    }
    this._lastRefreshToken = refresh_token;

    const userinfo = await this._getUserinfo(access_token);

    const expireInMilliseconds = expires_in
      ? expires_in * 1000
      : this.config.expiresIn;
    const expireTime =
      new Date().getTime() + expireInMilliseconds - this.config.refreshLeeway;

    this._scheduleRefresh(expireTime, refresh_token, redirectUri);

    return new TrackedObject({
      access_token,
      refresh_token,
      userinfo,
      id_token,
      expireTime,
      redirectUri,
    });
  }

  /**
   * Return a random jitter in [0, maxJitter) to spread scheduled
   * refreshes across tabs.  Overridable in tests for determinism.
   */
  _refreshJitter() {
    const maxJitter = this.config.refreshLeeway || REFRESH_JITTER_FALLBACK_MS;
    return Math.floor(Math.random() * maxJitter);
  }

  /**
   * Schedule a token refresh before the access token expires.
   *
   * @param {Number} expireTime Timestamp (ms) when the access token expires
   * @param {String} token The refresh token to use
   * @param {String} redirectUri The redirect URI for the token endpoint
   */
  _scheduleRefresh(expireTime, token, redirectUri) {
    if (!expireTime || expireTime <= new Date().getTime()) {
      return;
    }

    if (this._upcomingRefresh) {
      cancel(this._upcomingRefresh);
      this._upcomingRefresh = null;
    }

    const generation = (this._refreshGeneration =
      (this._refreshGeneration || 0) + 1);

    // Capture the expireTime we used to schedule this timer.  When the
    // callback fires we compare it against the session store's current
    // expireTime — if they differ, another tab already refreshed.
    // expireTime is the most reliable signal because it changes on every
    // refresh regardless of whether the OIDC provider rotates refresh tokens.
    const scheduledExpireTime = expireTime;

    this._upcomingRefresh = later(
      this,
      async (refreshToken) => {
        try {
          // Multi-tab guard: check if another tab already refreshed.
          // We compare both expireTime (always changes) and refresh_token
          // (changes with token rotation).  Either difference means
          // another tab already refreshed — skip to avoid racing.
          const currentExpireTime =
            this.session?.data?.authenticated?.expireTime;
          const currentRefreshToken =
            this.session?.data?.authenticated?.refresh_token;
          const anotherTabRefreshed =
            (currentExpireTime && currentExpireTime !== scheduledExpireTime) ||
            (currentRefreshToken && currentRefreshToken !== refreshToken);

          if (anotherTabRefreshed) {
            debug("Scheduled refresh skipped — another tab already refreshed");
            if (currentExpireTime && currentExpireTime > new Date().getTime()) {
              this._scheduleRefresh(
                currentExpireTime,
                currentRefreshToken || refreshToken,
                redirectUri,
              );
            }
            return;
          }

          const data = await this._refresh(refreshToken, redirectUri);
          if (this._refreshGeneration !== generation || this.isDestroyed) {
            return;
          }
          this._upcomingRefresh = null;
          this.trigger("sessionDataUpdated", data);
        } catch (e) {
          debug(`Scheduled token refresh failed: ${e}`);
        }
      },
      token,
      expireTime - new Date().getTime() + this._refreshJitter(),
    );
  }

  /**
   * Builds query parameters string for the authorize or refresh request
   *
   * @param {*} options
   * @returns string
   */
  _buildBodyQuery({
    code,
    redirectUri,
    codeVerifier,
    isRefresh = false,
    refresh_token,
    customParams = {},
  }) {
    const bodyObject = {
      redirect_uri: redirectUri,
      client_id: this.config.clientId,
      grant_type: isRefresh ? "refresh_token" : "authorization_code",
      ...customParams,
    };

    if (!isRefresh && code) {
      bodyObject.code = code;
      if (this.config.enablePkce) {
        bodyObject.code_verifier = codeVerifier;
      }
    }

    if (isRefresh && refresh_token) {
      bodyObject.refresh_token = refresh_token;
    }

    const bodyQuery = Object.keys(bodyObject)
      .map((k) => `${k}=${encodeURIComponent(bodyObject[k])}`)
      .join("&");

    return bodyQuery;
  }
}
