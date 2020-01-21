import EmberObject from "@ember/object";
import config from "ember-get-config";
import { setupTest } from "ember-qunit";
import OIDCEndSessionRouteMixin from "ember-simple-auth-oidc/mixins/oidc-end-session-route-mixin";
import { module, test } from "qunit";

const { endSessionEndpoint, afterLogoutUri } = config["ember-simple-auth-oidc"];

module("Unit | Mixin | oidc-end-session-route-mixin", function(hooks) {
  setupTest(hooks);

  test("it can make an invalidate request", function(assert) {
    assert.expect(3);

    const Route = EmberObject.extend(OIDCEndSessionRouteMixin);

    const subject = Route.create({
      session: EmberObject.create({
        data: { authenticated: { id_token: "myIdToken" } },
        async invalidate() {}
      }),
      _redirectToUrl(url) {
        assert.ok(new RegExp(endSessionEndpoint).test(url));
        assert.ok(
          new RegExp(`post_logout_redirect_uri=${afterLogoutUri}`).test(url)
        );
        assert.ok(new RegExp("id_token_hint=myIdToken").test(url));
      }
    });

    subject.afterModel(null, { queryParams: {} });
  });
});
