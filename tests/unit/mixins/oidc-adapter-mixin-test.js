import EmberObject from "@ember/object";
import OidcAdapterMixinMixin from "ember-simple-auth-oidc/mixins/oidc-adapter-mixin";
import { module, test } from "qunit";

module("Unit | Mixin | oidc-adapter-mixin", function() {
  test("it sets the correct headers", function(assert) {
    assert.expect(2);

    const OidcAdapterMixinObject = EmberObject.extend(OidcAdapterMixinMixin);

    const subject = OidcAdapterMixinObject.create({
      session: {
        isAuthenticated: true,
        data: {
          authenticated: {
            access_token: "SOMESECRETTOKEN"
          }
        }
      }
    });

    assert.deepEqual(subject.headers, {
      Authorization: "Bearer SOMESECRETTOKEN"
    });

    subject.set("session.isAuthenticated", false);

    assert.deepEqual(subject.headers, {});
  });
});
