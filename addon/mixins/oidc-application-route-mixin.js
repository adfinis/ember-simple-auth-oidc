import Mixin from "@ember/object/mixin";
import { inject as service } from "@ember/service";
import config from "ember-simple-auth-oidc/config";
import getAbsoluteUrl from "ember-simple-auth-oidc/utils/absoluteUrl";
import ApplicationRouteMixin from "ember-simple-auth/mixins/application-route-mixin";

const { host, endSessionEndpoint, afterLogoutUri } = config;

export default Mixin.create(ApplicationRouteMixin, {
  session: service(),
  router: service(),

  /**
   * This method is called after a successful authentication and continues an
   * intercepted transition if a URL is stored in `continueTransition` in the
   * localstorage. Otherwise call the parent/super to invoke the normal
   * behavior of the `sessionAuthenticated` method.
   *
   * @method sessionAuthenticated
   * @public
   */
  sessionAuthenticated() {
    const continueTransition = this.get("session.data.continueTransition");
    this.session.set("data.continueTransition", undefined);

    if (continueTransition) {
      this.replaceWith(continueTransition);
    } else {
      this._super();
    }
  },

  _redirectToUrl(url) {
    location.replace(url);
  },

  sessionInvalidated() {
    if (!endSessionEndpoint) {
      return;
    }

    const params = [];

    if (afterLogoutUri) {
      params.push(`post_logout_redirect_uri=${getAbsoluteUrl(afterLogoutUri)}`);
    }

    const idToken = this.session.get("data.authenticated.id_token");
    if (idToken) {
      params.push(`id_token_hint=${idToken}`);
    }

    return this._redirectToUrl(
      `${getAbsoluteUrl(host)}${endSessionEndpoint}?${params.join("&")}`
    );
  }
});
