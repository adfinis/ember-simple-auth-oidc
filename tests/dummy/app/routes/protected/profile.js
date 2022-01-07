import Route from "@ember/routing/route";
import { inject as service } from "@ember/service";

export default class ProtectedProfileRoute extends Route {
  @service store;

  model() {
    return this.store.findRecord("user", 1);
  }
}
