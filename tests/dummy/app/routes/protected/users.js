import Route from "@ember/routing/route";

export default class ProtectedUsersRoute extends Route {
  model() {}

  setupController(controller, model) {
    controller.users = null;
    super.setupController(controller, model);
  }
}
