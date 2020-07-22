import EmberObject from "@ember/object";
import { setupTest } from "ember-qunit";
import OidcApplicationRouteMixin from "ember-simple-auth-oidc/mixins/oidc-application-route-mixin";
import { module, test } from "qunit";

module("Unit | Mixin | oidc-application-route-mixin", function (hooks) {
  setupTest(hooks);

  test("it continues a stored transition", function (assert) {
    assert.expect(1);

    const session = this.owner.lookup("service:session");
    session.set("data.nextURL", "protected/secret");

    const Route = EmberObject.extend(OidcApplicationRouteMixin);

    const subject = Route.create(this.owner.ownerInjection(), {
      session,
      replaceWith(url) {
        assert.equal(url, "protected/secret");
      },
    });

    subject.sessionAuthenticated();
  });
});
