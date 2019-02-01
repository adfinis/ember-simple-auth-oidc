import Mixin from "@ember/object/mixin";
import { inject as service } from "@ember/service";
import config from "ember-simple-auth-oidc/config";
import getAbsoluteUrl from "ember-simple-auth-oidc/utils/absoluteUrl";

const { host, endSessionEndpoint, afterLogoutUri } = config;

export default Mixin.create({
  session: service(),

  // eslint-disable-next-line no-unused-vars
  afterModel(model) {
    if (!endSessionEndpoint) {
      return this.session.invalidate();
    }

    return this._handleRedirect();
  },

  _handleRedirect() {
    const params = [];

    if (afterLogoutUri) {
      params.push(`post_logout_redirect_uri=${getAbsoluteUrl(afterLogoutUri)}`);
    }

    const idToken = this.session.get("data.authenticated.id_token");
    if (idToken) {
      params.push(`id_token_hint=${idToken}`);
    }

    this.session.invalidate();

    let endSessionUri = `${getAbsoluteUrl(host)}${endSessionEndpoint}`;
    if (params.length > 0) {
      endSessionUri = `${endSessionUri}?${params.join("&")}`;
    }

    this._redirectToUrl(endSessionUri);
  },

  _redirectToUrl(url) {
    location.replace(url);
  }
});
