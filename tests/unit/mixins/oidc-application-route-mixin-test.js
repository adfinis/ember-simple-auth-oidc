import EmberObject from "@ember/object";
import config from "ember-get-config";
import { setupTest } from "ember-qunit";
import OidcApplicationRouteMixin from "ember-simple-auth-oidc/mixins/oidc-application-route-mixin";
import { module, test } from "qunit";

const { endSessionEndpoint, afterLogoutUri } = config["ember-simple-auth-oidc"];

module("Unit | Mixin | oidc-application-route-mixin", function(hooks) {
  setupTest(hooks);

  test("it continues a stored transition", function(assert) {
    assert.expect(1);

    const session = this.owner.lookup("service:session");
    session.set("data.nextURL", "protected/profile");

    const Route = EmberObject.extend(OidcApplicationRouteMixin);

    const subject = Route.create({
      session,
      replaceWith(url) {
        assert.equal(url, "protected/profile");
      }
    });

    subject.sessionAuthenticated();
  });

  test("it can make an invalidate request", function(assert) {
    assert.expect(3);

    const Route = EmberObject.extend(OidcApplicationRouteMixin);

    const subject = Route.create({
      session: EmberObject.create({
        data: { id_token_prev: "myIdToken" },
        on() {}
      }),
      _redirectToUrl(url) {
        assert.ok(new RegExp(endSessionEndpoint).test(url));
        assert.ok(
          new RegExp(`post_logout_redirect_uri=${afterLogoutUri}`).test(url)
        );
        assert.ok(new RegExp("id_token_hint=myIdToken").test(url));
      }
    });

    subject.sessionInvalidated(null, { queryParams: {} });
  });
});
