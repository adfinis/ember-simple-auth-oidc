import EmberObject from "@ember/object";
import OIDCAuthenticationRouteMixin from "ember-simple-auth-oidc/mixins/oidc-authentication-route-mixin";
import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import config from "ember-get-config";

const { authEndpoint, clientId } = config["ember-simple-auth-oidc"];

module("Unit | Mixin | oidc-authentication-route-mixin", function(hooks) {
  setupTest(hooks);

  test("it can handle an unauthenticated request", function(assert) {
    assert.expect(3);

    let Route = EmberObject.extend(OIDCAuthenticationRouteMixin);

    let subject = Route.create({
      redirectUri: "test",
      session: EmberObject.create({ data: { authenticated: {} } }),
      _redirectToUrl(url) {
        assert.ok(url.includes(authEndpoint));

        assert.ok(url.includes(`client_id=${clientId}`));
        assert.ok(url.includes("redirect_uri=test"));
      }
    });

    subject.afterModel(null, { to: { queryParams: {} } });
  });

  test("it can handle a request with an authentication code", function(assert) {
    assert.expect(1);

    let Route = EmberObject.extend(OIDCAuthenticationRouteMixin);

    let subject = Route.create({
      redirectUri: "test",
      session: EmberObject.create({
        data: {
          authenticated: {}
        },
        async authenticate(_, { code }) {
          assert.equal(code, "sometestcode");
        }
      }),
      transitionTo() {
        return { abort() {} };
      }
    });

    subject.afterModel(null, { to: { queryParams: { code: "sometestcode" } } });
  });

  test("it can handle older version of router_js", function(assert) {
    assert.expect(1);

    let Route = EmberObject.extend(OIDCAuthenticationRouteMixin);

    let subject = Route.create({
      redirectUri: "test",
      session: EmberObject.create({
        data: {
          authenticated: {}
        },
        async authenticate(_, { code }) {
          assert.equal(code, "sometestcode");
        }
      }),
      transitionTo() {
        return { abort() {} };
      }
    });

    subject.afterModel(null, { queryParams: { code: "sometestcode" } });
  });

  test("it can handle a failing authentication", function(assert) {
    assert.expect(2);

    let Route = EmberObject.extend(OIDCAuthenticationRouteMixin);

    let subject = Route.create({
      redirectUri: "test",
      session: EmberObject.create({
        data: {
          authenticated: {},
          state: "state2"
        },
        async authenticate() {
          return true;
        }
      })
    });

    // fails because the state is not correct (CSRF)
    subject
      .afterModel(null, {
        to: {
          queryParams: { code: "sometestcode", state: "state1" }
        }
      })
      .catch(e => {
        assert.ok(/State did not match/.test(e.message));
      });

    subject.session.authenticate = async () => {
      throw new Error();
    };

    // fails because of the error in authenticate
    assert.rejects(
      subject.afterModel(null, {
        to: {
          queryParams: { code: "sometestcode", state: "state2" }
        }
      }),
      Error
    );
  });

  test("it forwards customized login_hint param", function(assert) {
    assert.expect(4);

    let Route = EmberObject.extend(OIDCAuthenticationRouteMixin);

    let subject = Route.create({
      redirectUri: "test",
      session: EmberObject.create({ data: { authenticated: {} } }),
      _redirectToUrl(url) {
        assert.ok(url.includes(authEndpoint));

        assert.ok(url.includes(`client_id=${clientId}`));
        assert.ok(url.includes("redirect_uri=test"));
        assert.ok(url.includes("custom_login_hint=my-idp"));
      }
    });

    subject.afterModel(null, {
      to: { queryParams: { custom_login_hint: "my-idp" } }
    });
  });
});
