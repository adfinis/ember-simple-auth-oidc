import { set } from "@ember/object";
import setupMirage from "ember-cli-mirage/test-support/setup-mirage";
import { setupTest } from "ember-qunit";
import { module, test } from "qunit";

module("Unit | Service | session", function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test("it can trigger a single logout", async function (assert) {
    const authenticator = this.owner.lookup("authenticator:oidc");
    const session = this.owner.lookup("service:session");
    set(session, "session.authenticator", "authenticator:oidc");
    set(session, "data.authenticated.id_token", "x.y.z");

    authenticator.singleLogout = () => {
      assert.step("singleLogout");
    };
    session.invalidate = () => {
      assert.step("invalidate");
    };

    await session.singleLogout();
    assert.verifySteps(["invalidate", "singleLogout"]);
  });

  test("it can trigger an authentication refresh", async function (assert) {
    const authenticator = this.owner.lookup("authenticator:oidc");
    authenticator._refresh = () => {
      assert.step("refresh");
    };

    const session = this.owner.lookup("service:session");
    session.session.isAuthenticated = true;
    session.session.content = { authenticated: { expireTime: 1 } };

    await session.refreshAuthentication.perform();
    assert.verifySteps(["refresh"]);
    assert.notStrictEqual(
      session.data.authenticated.expireTime,
      1,
      "Updates expiry time",
    );

    set(session, "data.authenticated.expireTime", new Date().getTime() + 10000);
    await session.refreshAuthentication.perform();
    assert.verifySteps([]);
  });

  test("it can compute authentication headers", function (assert) {
    const session = this.owner.lookup("service:session");
    const internalSession = session.session;
    internalSession.isAuthenticated = true;
    internalSession.content = {
      authenticated: { access_token: "SOMESECRETTOKEN" },
    };

    assert.deepEqual(session.headers, {
      Authorization: "Bearer SOMESECRETTOKEN",
    });

    set(internalSession, "isAuthenticated", false);

    assert.deepEqual(session.headers, {});
  });

  test("it continues a stored transition", function (assert) {
    const session = this.owner.lookup("service:session");
    set(session, "data.nextURL", "/protected/secret");

    const router = this.owner.lookup("service:router");
    router.replaceWith = (url) => {
      assert.strictEqual(url, "/protected/secret");
    };

    session.handleAuthentication();
  });
});
