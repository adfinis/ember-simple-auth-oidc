import Mixin from "@ember/object/mixin";
import { inject as service } from "@ember/service";
import config from "ember-simple-auth-oidc/config";
import v4 from "uuid/v4";

const { host, endSessionEndpoint, logoutRoute } = config;

export default Mixin.create({
  session: service(),

  async afterModel(
    _,
    {
      queryParams: { state }
    }
  ) {
    if (!endSessionEndpoint) {
      this.session.invalidate();
    }

    if (state) {
      return this._handleCallback(state);
    }

    return this._handleRedirect();
  },

  _handleRedirect() {
    const state = v4();

    this.session.set("data.state", state);

    const redirectUri = `${location.protocol}//${location.host}${logoutRoute}`;
    const idToken = this.session.get("data.authenticated.id_token");

    location.replace(
      `${host}${endSessionEndpoint}?` +
        `id_token_hint=${idToken}&` +
        `post_logout_redirect_uri=${redirectUri}&` +
        `state=${state}`
    );
  },

  _handleCallback(state) {
    if (state !== this.session.get("data.state")) {
      throw new Error("End session state did not match");
    }

    this.session.set("data.state", undefined);

    this.session.invalidate();
  }
});
