import { set } from "@ember/object";
import setupMirage from "ember-cli-mirage/test-support/setup-mirage";
import config from "ember-get-config";
import { setupTest } from "ember-qunit";
import { module, test } from "qunit";

const { endSessionEndpoint, afterLogoutUri } = config["ember-simple-auth-oidc"];

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
    assert.expect(4);

    const subject = this.owner.lookup("authenticator:oidc");

    set(subject, "redirectUri", "test");

    const data = await subject.authenticate({ code: "test" });

    assert.ok(data.access_token, "Returns an access token");
    assert.ok(data.refresh_token, "Returns a refresh token");
    assert.ok(data.userinfo, "Returns the user info");
    assert.ok(data.expireTime, "Returns the time at which the token expires");
  });

  test("it can restore a session", async function (assert) {
    assert.expect(4);

    const subject = this.owner.lookup("authenticator:oidc");

    const data = await subject.restore({
      refresh_token: `refresh.${getTokenBody(false)}.token`,
      expireTime: new Date().getTime(),
      redirectUri: "test",
    });

    assert.ok(data.access_token, "Returns an access token");
    assert.ok(data.refresh_token, "Returns a refresh token");
    assert.ok(data.userinfo, "Returns the user info");
    assert.ok(data.expireTime, "Returns the time at which the token expires");
  });

  test("it can invalidate a session", async function (assert) {
    assert.expect(1);

    const subject = this.owner.lookup("authenticator:oidc");

    assert.ok(await subject.invalidate());
  });

  test("it can refresh a session", async function (assert) {
    assert.expect(4);

    const subject = this.owner.lookup("authenticator:oidc");

    const data = await subject._refresh("x.y.z");

    assert.ok(data.access_token, "Returns an access token");
    assert.ok(data.refresh_token, "Returns a refresh token");
    assert.ok(data.userinfo, "Returns the user info");
    assert.ok(data.expireTime, "Returns the time at which the token expires");
  });

  test("it can make a single logout", async function (assert) {
    assert.expect(3);

    const subject = this.owner.lookup("authenticator:oidc");

    subject._redirectToUrl = (url) => {
      assert.ok(new RegExp(endSessionEndpoint).test(url));
      assert.ok(
        new RegExp(`post_logout_redirect_uri=${afterLogoutUri}`).test(url)
      );
      assert.ok(new RegExp("id_token_hint=myIdToken").test(url));
    };

    subject.singleLogout("myIdToken");
  });
});
