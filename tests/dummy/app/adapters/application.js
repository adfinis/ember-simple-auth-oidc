import { inject as service } from "@ember/service";
import OIDCJSONAPIAdapter from "ember-simple-auth-oidc/adapters/oidc-json-api-adapter";

export default class ApplicationAdapter extends OIDCJSONAPIAdapter {
  @service session;

  get headers() {
    return { ...this.session.headers, "Content-Language": "en-us" };
  }
}
