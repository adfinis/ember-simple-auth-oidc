import { set } from "@ember/object";
import setupMirage from "ember-cli-mirage/test-support/setup-mirage";
import { setupTest } from "ember-qunit";
import { module, test } from "qunit";

const getTokenBody = (expired) => {
  const time = expired ? -30 : 120;
  return btoa(
    JSON.stringify({
      exp: Date.now() + time,
    }),
  );
};

module("Unit | Authenticator | OIDC", function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test("it can authenticate", async function (assert) {
    const subject = this.owner.lookup("authenticator:oidc");

    set(subject, "redirectUri", "test");

    const data = await subject.authenticate({ code: "test" });

    assert.ok(data.access_token, "Returns an access token");
    assert.ok(data.refresh_token, "Returns a refresh token");
    assert.ok(data.userinfo, "Returns the user info");
    assert.ok(data.expireTime, "Returns the time at which the token expires");
  });

  test("it can restore a session", async function (assert) {
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
    const subject = this.owner.lookup("authenticator:oidc");

    assert.ok(await subject.invalidate());
  });

  test("it can refresh a session", async function (assert) {
    const subject = this.owner.lookup("authenticator:oidc");

    const data = await subject._refresh("x.y.z");

    assert.ok(data.access_token, "Returns an access token");
    assert.ok(data.refresh_token, "Returns a refresh token");
    assert.ok(data.userinfo, "Returns the user info");
    assert.ok(data.expireTime, "Returns the time at which the token expires");
  });

  module("single logout", function (hooks) {
    hooks.beforeEach(function () {
      this.env =
        this.owner.resolveRegistration("config:environment")[
          "ember-simple-auth-oidc"
        ];
      this._originalHost = this.env.host;
      this.env.host = "https://some-other-domain.com";
    });

    hooks.afterEach(function () {
      this.env.host = this._originalHost;
    });

    test("it can make a single logout", async function (assert) {
      const { endSessionEndpoint, afterLogoutUri } =
        this.owner.lookup("service:config");
      const subject = this.owner.lookup("authenticator:oidc");
      const { protocol, host } = location;

      subject._redirectToUrl = (url) => {
        assert.ok(new RegExp(endSessionEndpoint).test(url));
        assert.ok(
          new RegExp(
            `post_logout_redirect_uri=${protocol}//${host}${afterLogoutUri}`,
          ).test(url),
        );
        assert.ok(new RegExp("id_token_hint=myIdToken").test(url));
      };

      subject.singleLogout("myIdToken");
    });
  });

  test("it supports sending custom parameters", function (assert) {
    const bodyOptions = {
      code: "test-code",
      codeVerifier: "test-verifier",
      redirectUri: "test/redirect",
      isRefresh: true,
      refresh_token: "test-refresh-token",
      customParams: { foo: "bar" },
    };

    const subject = this.owner.lookup("authenticator:oidc");
    const bodyWithRefresh = subject._buildBodyQuery(bodyOptions);
    assert.strictEqual(
      bodyWithRefresh,
      "redirect_uri=test%2Fredirect&client_id=test-client&grant_type=refresh_token&foo=bar&refresh_token=test-refresh-token",
    );

    bodyOptions.isRefresh = false;
    const bodyWithoutRefresh = subject._buildBodyQuery(bodyOptions);
    assert.strictEqual(
      bodyWithoutRefresh,
      "redirect_uri=test%2Fredirect&client_id=test-client&grant_type=authorization_code&foo=bar&code=test-code",
    );
  });
});
