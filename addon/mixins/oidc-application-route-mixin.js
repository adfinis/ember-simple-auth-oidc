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
   * intercepted transition if a URL is stored in `nextURL` in the
   * localstorage. Otherwise call the parent/super to invoke the normal
   * behavior of the `sessionAuthenticated` method.
   *
   * @method sessionAuthenticated
   * @public
   */
  sessionAuthenticated() {
    const nextURL = this.session.data.nextURL;
    this.session.set("data.nextURL", undefined);
    const idToken = this.session.data.authenticated.id_token;
    this.session.set("data.id_token_prev", idToken);

    if (nextURL) {
      this.replaceWith(nextURL);
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

    const idToken = this.session.get("data.id_token_prev");
    if (idToken) {
      params.push(`id_token_hint=${idToken}`);
    }

    return this._redirectToUrl(
      `${getAbsoluteUrl(host)}${endSessionEndpoint}?${params.join("&")}`
    );
  },
});
