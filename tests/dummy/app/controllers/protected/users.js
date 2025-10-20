import Controller from "@ember/controller";
import { action } from "@ember/object";
import { service } from "@ember/service";
import { tracked } from "@glimmer/tracking";

export default class ProtectedUsersController extends Controller {
  @service store;
  @tracked users;

  @action
  async fetchUsers() {
    this.users = await this.store.findAll("user");
  }
}
