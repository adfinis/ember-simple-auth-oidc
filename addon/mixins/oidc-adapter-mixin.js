import { computed } from "@ember/object";
import Mixin from "@ember/object/mixin";
import { inject } from "@ember/service";
import { handleUnauthorized } from "ember-simple-auth-oidc";
import config from "ember-simple-auth-oidc/config";
import DataAdapterMixin from "ember-simple-auth/mixins/data-adapter-mixin";

const { authHeaderName, authPrefix, tokenPropertyName } = config;

export default Mixin.create(DataAdapterMixin, {
  session: inject(),

  /**
   * Watch the `data.authenticated.id_token` to recomputed the headers as
   * according to the openid-connect specification the `id_token` must always
   * be included.
   * https://openid.net/specs/openid-connect-core-1_0.html#TokenResponse
   */
  headers: computed(
    "session.{data.authenticated.id_token,isAuthenticated}",
    function () {
      const headers = {};

      if (this.session.isAuthenticated) {
        const token = this.get(
          `session.data.authenticated.${tokenPropertyName}`
        );

        Object.assign(headers, { [authHeaderName]: `${authPrefix} ${token}` });
      }

      return headers;
    }
  ),

  ensureResponseAuthorized(status) {
    if (status === 401) {
      handleUnauthorized(this.session);
    }
  },
});
