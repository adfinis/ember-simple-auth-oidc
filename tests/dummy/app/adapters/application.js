import { inject as service } from "@ember/service";
import OIDCAdapter from "ember-simple-auth-oidc/adapters/oidc-adapter";

export default class ApplicationAdapter extends OIDCAdapter {
  @service session;

  get headers() {
    return { ...this.session.headers, "Content-Language": "en-us" };
  }
}
