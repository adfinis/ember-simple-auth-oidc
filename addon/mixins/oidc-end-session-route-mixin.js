import Mixin from "@ember/object/mixin";
import { inject as service } from "@ember/service";
import config from "ember-simple-auth-oidc/config";

const { host, endSessionEndpoint, logoutRoute } = config;

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
    const redirectUri = `${location.protocol}//${location.host}${logoutRoute}`;
    const idToken = this.session.get("data.authenticated.id_token");

    this.session.invalidate();

    location.replace(
      `${host}${endSessionEndpoint}?` +
        `id_token_hint=${idToken}&` +
        `post_logout_redirect_uri=${redirectUri}`
    );
  }
});
