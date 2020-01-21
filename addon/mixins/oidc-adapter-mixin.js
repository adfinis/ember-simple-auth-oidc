import Mixin from "@ember/object/mixin";
import { inject } from "@ember/service";
import config from "ember-simple-auth-oidc/config";
import DataAdapterMixin from "ember-simple-auth/mixins/data-adapter-mixin";

const { authHeaderName, authPrefix, tokenPropertyName } = config;

export default Mixin.create(DataAdapterMixin, {
  session: inject(),

  authorize(xhr) {
    const token = this.get(`session.data.authenticated.${tokenPropertyName}`);

    if (this.get("session.isAuthenticated") && token) {
      xhr.setRequestHeader(authHeaderName, `${authPrefix} ${token}`);
    }
  }
});
