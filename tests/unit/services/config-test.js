import setupMirage from "ember-cli-mirage/test-support/setup-mirage";
import { setupTest } from "ember-qunit";
import { module, test } from "qunit";

import {
  applyAliases,
  camelizeObjectKeys,
} from "ember-simple-auth-oidc/services/config";

module("Unit | Service | config", function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.envConfig =
      this.owner.resolveRegistration("config:environment")[
        "ember-simple-auth-oidc"
      ];
  });

  test("camelize configuration keys", function (assert) {
    const camelized = camelizeObjectKeys({
      authorization_endpoint: "auth",
      token_Endpoint: "token",
    });

    assert.strictEqual(camelized.authorizationEndpoint, "auth");
    assert.strictEqual(camelized.tokenEndpoint, "token");
  });

  test("alias configuration keys", function (assert) {
    const aliased1 = applyAliases({
      authorizationEndpoint: "auth",
    });
    const aliased2 = applyAliases({
      authEndpoint: "auth",
    });

    assert.strictEqual(aliased1.authEndpoint, "auth");
    assert.strictEqual(aliased2.authEndpoint, "auth");
  });

  test("fetch configuration if necessary keys are not given", async function (assert) {
    const configService = this.owner.lookup("service:config");
    configService.resolvedConfig.tokenEndpoint = null;

    const wellKnownUrl = `${configService.host}/.well-known/openid-configuration`;
    this.server.pretender.handledRequest = (verb, path) => {
      if (verb === "GET" && path === wellKnownUrl) {
        assert.step("fetched_config");
      }
    };

    await configService.loadConfig();

    assert.verifySteps(["fetched_config"]);
    assert.strictEqual(
      configService.tokenEndpoint,
      "http://localhost:4200/realms/test-realm/protocol/openid-connect/token",
    );
  });
});
