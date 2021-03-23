import Route from "@ember/routing/route";

export default class ProtectedProfileRoute extends Route {
  model() {
    return this.store.findRecord("user", 1);
  }
}
