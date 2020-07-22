import JSONAPIAdapter from "@ember-data/adapter/json-api";
import OIDCAdapterMixin from "ember-simple-auth-oidc/mixins/oidc-adapter-mixin";

export default JSONAPIAdapter.extend(OIDCAdapterMixin, {});
