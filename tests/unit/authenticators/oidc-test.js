import setupMirage from "ember-cli-mirage/test-support/setup-mirage";
import { setupTest } from "ember-qunit";
import { module, test } from "qunit";

const getTokenBody = (expired) => {
  const time = expired ? -30 : 120;
  return btoa(
    JSON.stringify({
      exp: Date.now() + time,
    })
  );
};

module("Unit | Authenticator | OIDC", function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test("it can authenticate", async function (assert) {
    assert.expect(6);

    const subject = this.owner.lookup("authenticator:oidc");

    subject.set("redirectUri", "test");
    subject._scheduleRefresh = (expireTime, refreshToken) => {
      assert.ok(expireTime);
      assert.ok(refreshToken);
    };

    const data = await subject.authenticate({ code: "test" });

    assert.ok(data.access_token, "Returns an access token");
    assert.ok(data.refresh_token, "Returns a refresh token");
    assert.ok(data.userinfo, "Returns the user info");
    assert.ok(data.expireTime, "Returns the time at which the token expires");
  });

  test("it can restore a session", async function (assert) {
    assert.expect(6);

    const subject = this.owner.lookup("authenticator:oidc");

    subject.set("redirectUri", "test");
    subject._scheduleRefresh = (expireTime, refreshToken) => {
      assert.ok(expireTime);
      assert.ok(refreshToken);
    };

    const data = await subject.restore({
      refresh_token: `refresh.${getTokenBody(false)}.token`,
      expireTime: new Date().getTime(),
    });

    assert.ok(data.access_token, "Returns an access token");
    assert.ok(data.refresh_token, "Returns a refresh token");
    assert.ok(data.userinfo, "Returns the user info");
    assert.ok(data.expireTime, "Returns the time at which the token expires");
  });

  test("it can invalidate a session", async function (assert) {
    assert.expect(1);

    const subject = this.owner.lookup("authenticator:oidc");

    subject.set("redirectUri", "test");

    assert.ok(
      await subject.invalidate({
        refresh_token: "x.y.z",
      })
    );
  });

  test("it can refresh a session", async function (assert) {
    assert.expect(6);

    const subject = this.owner.lookup("authenticator:oidc");

    subject.set("redirectUri", "test");
    subject._scheduleRefresh = (expireTime, refreshToken) => {
      assert.ok(expireTime);
      assert.ok(refreshToken);
    };

    const data = await subject._refresh("x.y.z");

    assert.ok(data.access_token, "Returns an access token");
    assert.ok(data.refresh_token, "Returns a refresh token");
    assert.ok(data.userinfo, "Returns the user info");
    assert.ok(data.expireTime, "Returns the time at which the token expires");
  });

  test("it can schedule a refresh", async function (assert) {
    assert.expect(1);

    const subject = this.owner.lookup("authenticator:oidc");

    subject._refresh = (token) => {
      assert.equal(token, "testtoken");
    };

    subject._scheduleRefresh(new Date().getTime() + 500, "testtoken");
  });
});
