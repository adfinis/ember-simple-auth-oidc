import Mixin from "@ember/object/mixin";
import AuthenticatedRouteMixin from "ember-simple-auth/mixins/authenticated-route-mixin";
import config from "ember-simple-auth-oidc/config";
import v4 from "uuid/v4";

const { host, endSessionEndpoint, logoutRoute } = config;

export default Mixin.create(AuthenticatedRouteMixin, {
  async afterModel(
    _,
    {
      queryParams: { state }
    }
  ) {
    if (!endSessionEndpoint) {
      this.session.invalidate();
    }

    this._handleRedirect();
  },

  _handleRedirect() {
    const state = v4();

    this.session.set("data.state", state);

    const redirectUri = `${location.protocol}//${location.host}${logoutRoute}`;

    location.replace(
      `${host}${endSessionEndpoint}?` +
        `post_logout_redirect_uri=${redirectUri}` +
        `state=${state}`
    );
  }
});
