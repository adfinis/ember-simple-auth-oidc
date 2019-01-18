import Mixin from "@ember/object/mixin";
import { inject as service } from "@ember/service";
import config from "ember-simple-auth-oidc/config";

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
      const redirectUri =
        afterLogoutUri.indexOf("http") === 0
          ? afterLogoutUri
          : `${location.protocol}//${location.host}${afterLogoutUri}`;

      params.push(`post_logout_redirect_uri=${redirectUri}`);
    }

    const idToken = this.session.get("data.authenticated.id_token");
    if (idToken) {
      params.push(`id_token_hint=${idToken}`);
    }

    this.session.invalidate();

    let endSessionUri = `${host}${endSessionEndpoint}`;
    if (params.length > 0) {
      endSessionUri = `${endSessionUri}?${params.join("&")}`;
    }

    location.replace(endSessionUri);
  }
});
