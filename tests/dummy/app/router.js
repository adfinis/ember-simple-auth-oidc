import EmberRouter from "@ember/routing/router";
import config from "dummy/config/environment";

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

// eslint-disable-next-line array-callback-return
Router.map(function () {
  this.route("login");
  this.route("protected", function () {
    this.route("users");
    this.route("profile");
    this.route("secret");
    this.route("apollo");
  });
  this.route("oidc", {
    path: "realms/test-realm/protocol/openid-connect/auth",
  });
  this.route("oidcend", {
    path: "realms/test-realm/protocol/openid-connect/logout",
  });
});
