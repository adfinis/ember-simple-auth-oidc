import { set } from "@ember/object";
import setupMirage from "ember-cli-mirage/test-support/setup-mirage";
import { setupTest } from "ember-qunit";
import { module, test } from "qunit";
import { fake, stub } from "sinon";

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

  test.each(
    "it can use authentication refresh hooks with/without errors",
    [
      { shouldRefresh: false, hasError: false },
      { shouldRefresh: true, hasError: false },
      { shouldRefresh: true, hasError: true },
    ],
    async function (assert, { shouldRefresh, hasError }) {
      const session = this.owner.lookup("service:session");
      session.session.isAuthenticated = true;
      session.session.content = {
        authenticated: {
          expireTime: shouldRefresh ? 1 : new Date().getTime() + 10000,
        },
      };

      session.beforeRefreshAuthentication = fake();
      session.afterRefreshAuthentication = fake();
      session.onRefreshAuthenticationError = fake();

      if (hasError) {
        stub(session.session, "authenticate").rejects({
          errors: [{ test: "error" }],
        });
      } else {
        stub(session.session, "authenticate").resolves({ data: true });
      }

      await session.refreshAuthentication.perform();

      // beforeRefreshAuthentication should always be called.
      assert.ok(session.beforeRefreshAuthentication.calledOnce);
      if (hasError) {
        // afterRefreshAuthentication should not be called if there was an error.
        assert.notOk(session.afterRefreshAuthentication.calledOnce);
        assert.ok(session.onRefreshAuthenticationError.calledOnce);
        // onRefreshAuthenticationError receives the error thrown as an argument.
        assert.deepEqual(
          session.onRefreshAuthenticationError.firstCall.args[0],
          {
            errors: [{ test: "error" }],
          },
        );
      } else {
        // onRefreshAuthenticationError should not be called if there was no error.
        assert.notOk(session.onRefreshAuthenticationError.called);
        assert.ok(session.afterRefreshAuthentication.calledOnce);
        // afterRefreshAuthentication receives the response as an argument.
        assert.deepEqual(
          session.afterRefreshAuthentication.firstCall.args[0],
          shouldRefresh
            ? {
                data: true,
              }
            : null,
        );
      }
    },
  );

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
