import { set } from "@ember/object";
import setupMirage from "ember-cli-mirage/test-support/setup-mirage";
import config from "ember-get-config";
import { setupTest } from "ember-qunit";
import { module, test } from "qunit";

const { authEndpoint, clientId } = config["ember-simple-auth-oidc"];

module("Unit | Route | oidc-authentication", function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test("it can handle already authenticated requests", function (assert) {
    assert.expect(3);

    const router = this.owner.lookup("route:oidc-authentication");
    router.urlFor = () => "/test";

    const route = this.owner.lookup("route:oidc-authentication");
    route.session = this.owner.lookup("service:session");
    route.session.prohibitAuthentication = (route) => {
      assert.ok(route.includes("test"));
      assert.step("prohibitAuthentication");
    };

    route.beforeModel({ from: { name: "test" } });
    assert.verifySteps(["prohibitAuthentication"]);
  });

  test("it can handle an unauthenticated request", function (assert) {
    assert.expect(3);

    const router = this.owner.lookup("service:router");
    router.urlFor = () => "/test";

    const route = this.owner.lookup("route:oidc-authentication");
    route.session = this.owner.lookup("service:session");
    set(route.session, "data.authenticated", {});
    set(route.session, "attemptedTransition", { intent: {} });
    route._redirectToUrl = (url) => {
      assert.ok(url.includes(authEndpoint));
      assert.ok(url.includes(`client_id=${clientId}`));
      const { protocol, host } = location;
      assert.ok(url.includes(`redirect_uri=${protocol}//${host}/test`));
    };

    route.afterModel(null, { to: { queryParams: {} } });
  });

  test("it can handle a request with an authentication code", function (assert) {
    assert.expect(1);

    const routeFactory = this.owner.factoryFor("route:oidc-authentication");
    const route = new (class extends routeFactory.class {
      redirectUri = "test";
      session = {
        data: {
          authenticated: {},
        },
        async authenticate(_, { code }) {
          assert.equal(code, "sometestcode");
        },
        set() {},
      };
      transitionTo() {
        return { abort() {} };
      }
    })();

    route.afterModel(null, { to: { queryParams: { code: "sometestcode" } } });
  });

  test("it can handle older version of router_js", function (assert) {
    assert.expect(1);

    const routeFactory = this.owner.factoryFor("route:oidc-authentication");
    const route = new (class extends routeFactory.class {
      redirectUri = "test";
      session = {
        data: {
          authenticated: {},
        },
        async authenticate(_, { code }) {
          assert.equal(code, "sometestcode");
        },
        set() {},
      };
      transitionTo() {
        return { abort() {} };
      }
    })();

    route.afterModel(null, { queryParams: { code: "sometestcode" } });
  });

  test("it can handle a failing authentication", function (assert) {
    assert.expect(3);

    const routeFactory = this.owner.factoryFor("route:oidc-authentication");
    const route = new (class extends routeFactory.class {
      redirectUri = "test";
      session = {
        data: {
          authenticated: {},
          state: "state2",
        },
        async authenticate() {
          return true;
        },
      };
    })();

    // fails because the state is not correct (CSRF)
    route
      .afterModel(null, {
        to: {
          queryParams: { code: "sometestcode", state: "state1" },
        },
      })
      .catch((e) => {
        assert.ok(/State did not match/.test(e.message));
      });

    route.session.authenticate = async () => {
      throw new Error();
    };

    // fails because of the error in authenticate
    assert.rejects(
      route.afterModel(null, {
        to: {
          queryParams: { code: "sometestcode", state: "state2" },
        },
      }),
      Error
    );

    route.session.authenticate = async () => {
      throw { error: "unauthorized_client" };
    };

    // fails due to bad request response from authentication server
    assert.rejects(
      route.afterModel(null, {
        to: {
          queryParams: { code: "sometestcode", state: "state2" },
        },
      }),
      Error
    );
  });

  test("it forwards customized login_hint param", function (assert) {
    assert.expect(4);

    const routeFactory = this.owner.factoryFor("route:oidc-authentication");
    const route = new (class extends routeFactory.class {
      redirectUri = "test";
      session = {
        data: { authenticated: {} },
        set() {},
        attemptedTransition: { intent: {} },
      };
      _redirectToUrl(url) {
        assert.ok(url.includes(authEndpoint));

        assert.ok(url.includes(`client_id=${clientId}`));
        assert.ok(url.includes("redirect_uri=test"));
        assert.ok(url.includes("custom_login_hint=my-idp"));
      }
    })();

    route.afterModel(null, {
      to: { queryParams: { custom_login_hint: "my-idp" } },
    });
  });

  test("it stores an intercepted transition", function (assert) {
    assert.expect(1);

    const routeFactory = this.owner.factoryFor("route:oidc-authentication");
    const route = new (class extends routeFactory.class {
      redirectUri = "test";
      session = {
        data: { authenticated: {} },
        attemptedTransition: { intent: { url: "protected/profile" } },
        set(key, value) {
          set(this, key, value);
        },
      };
      _redirectToUrl() {
        assert.equal(this.session.data.nextURL, "protected/profile");
      }
    })();

    route.afterModel(null, { to: { queryParams: {} } });
  });
});
