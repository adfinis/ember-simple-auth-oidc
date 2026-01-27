import { service } from "@ember/service";
import { task } from "ember-concurrency";
import SessionServiceESA from "ember-simple-auth/services/session";

export default class Service extends SessionServiceESA {
  @service router;
  @service("esa-oidc-config") config;

  singleLogout() {
    const session = this.session; // InternalSession
    const authenticator = session._lookupAuthenticator(session.authenticator);
    const idToken = this.data.authenticated.id_token;

    // Invalidate the ember-simple-auth session
    this.invalidate();

    // Trigger a single logout on the authorization server
    return authenticator.singleLogout(idToken);
  }

  get redirectUri() {
    const { protocol, host } = location;
    const path = this.router.currentURL;
    return `${protocol}//${host}${path}`;
  }

  /**
   * Watch the `data.authenticated.id_token` to recomputed the headers as
   * according to the openid-connect specification the `id_token` must always
   * be included.
   * https://openid.net/specs/openid-connect-core-1_0.html#TokenResponse
   */
  get headers() {
    const headers = {};

    if (this.isAuthenticated) {
      const token = this.data.authenticated[this.config.tokenPropertyName];
      Object.assign(headers, {
        [this.config.authHeaderName]: `${this.config.authPrefix} ${token}`,
      });
    }

    return headers;
  }

  get shouldRefresh() {
    const expireTime = this.data.authenticated.expireTime;
    const isExpired = expireTime && expireTime <= new Date().getTime();

    return this.isAuthenticated && isExpired;
  }

  refreshAuthentication = task({ enqueue: true }, async () => {
    await this.beforeRefreshAuthentication();

    if (this.shouldRefresh) {
      try {
        const response = await this.session.authenticate("authenticator:oidc", {
          redirectUri: this.redirectUri,
          isRefresh: true,
        });

        await this.afterRefreshAuthentication(response);

        return response;
      } catch (error) {
        console.warn("Token is invalid. Re-authentification is required.");
        await this.onRefreshAuthenticationError(error);

        return;
      }
    }

    return await this.afterRefreshAuthentication(null);
  });

  async requireAuthentication(transition, routeOrCallback) {
    await this.refreshAuthentication.perform();
    return super.requireAuthentication(transition, routeOrCallback);
  }

  /**
   * This method is called after a successful authentication and continues an
   * intercepted transition if a URL is stored in `nextURL` in the
   * localstorage. Otherwise call the parent/super to invoke the normal
   * behavior of the `sessionAuthenticated` method.
   *
   * @method handleAuthentication
   * @public
   */
  handleAuthentication(routeAfterAuthentication) {
    const nextURL = this.data.nextURL;
    // nextURL is stored to the localStorage using the
    // session service's set method
    // eslint-disable-next-line ember/classic-decorator-no-classic-methods
    this.set("data.nextURL", undefined);

    if (nextURL) {
      this.router.replaceWith(nextURL);
    } else {
      super.handleAuthentication(routeAfterAuthentication);
    }
  }

  /**
   * Overwriting the standard behavior of handleInvalidation,
   * which is redirecting to the rootURL of the app. Since the OIDC addon
   * also triggers a redirect in some cases and this could lead to conflicts
   * we disable the ember-simple-auth behavior.
   * If you wish to redirect after invalidating the session, please handle
   * this by overwriting this method in your application route or at the
   * exact location where the session is invalidated.
   */
  handleInvalidation() {}

  /**
   * Hook method that can be overridden to add functionality before refreshing.
   *
   * @method beforeRefreshAuthentication
   */
  async beforeRefreshAuthentication() {}

  /**
   * Hook method that can be overridden to add functionality after refreshing.
   *
   * @method afterRefreshAuthentication
   * @param {Object} response The response from the server
   */
  // eslint-disable-next-line no-unused-vars
  async afterRefreshAuthentication(response) {}

  /**
   * Hook method that can be overridden to add functionality when refreshing fails.
   *
   * @method onRefreshAuthenticationError
   * @param {Object} error The error thrown during refreshing
   */
  // eslint-disable-next-line no-unused-vars
  async onRefreshAuthenticationError(error) {}
}
