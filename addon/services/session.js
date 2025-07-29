import { inject as service } from "@ember/service";
import { enqueueTask } from "ember-concurrency";
import SessionServiceESA from "ember-simple-auth/services/session";

export default class Service extends SessionServiceESA {
  @service router;
  @service config;

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

  @enqueueTask
  *refreshAuthentication() {
    const expireTime = this.data.authenticated.expireTime;
    const isExpired = expireTime && expireTime <= new Date().getTime();

    if (this.isAuthenticated && isExpired) {
      try {
        return yield this.session.authenticate("authenticator:oidc", {
          redirectUri: this.redirectUri,
          isRefresh: true,
        });
      } catch {
        console.warn("Token is invalid. Re-authentification is required.");
      }
    }
  }

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
}
