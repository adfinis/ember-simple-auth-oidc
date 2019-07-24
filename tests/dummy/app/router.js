import EmberRouter from "@ember/routing/router";
import config from "./config/environment";

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route("login");
  this.route("logout");
  this.route("protected", function() {
    this.route("profile");
  });
  this.route("oidc", {
    path: "realms/test-realm/protocol/openid-connect/auth"
  });
  this.route("oidcend", {
    path: "realms/test-realm/protocol/openid-connect/logout"
  });
});

export default Router;
