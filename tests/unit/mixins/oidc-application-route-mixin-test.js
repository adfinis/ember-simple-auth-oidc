import EmberObject from "@ember/object";
import OidcApplicationRouteMixin from "ember-simple-auth-oidc/mixins/oidc-application-route-mixin";
import { module, test } from "qunit";
import { setupTest } from "ember-qunit";

module("Unit | Mixin | oidc-application-route-mixin", function(hooks) {
  setupTest(hooks);

  test("it continues a stored transition", function(assert) {
    assert.expect(1);

    let session = this.owner.lookup("service:session");
    session.set("data.continueTransition", "protected/profile");

    let Route = EmberObject.extend(OidcApplicationRouteMixin);

    let subject = Route.create({
      session,
      transitionTo(url) {
        assert.equal(url, "protected/profile");
      }
    });

    subject.sessionAuthenticated();
  });
});
