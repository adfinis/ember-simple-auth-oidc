import { set } from "@ember/object";
import setupMirage from "ember-cli-mirage/test-support/setup-mirage";
import { setupTest } from "ember-qunit";
import { module, test } from "qunit";

module("Unit | Adapter | oidc json api adapter", function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test("it sets the correct headers", async function (assert) {
    const adapter = this.owner.lookup("adapter:oidc-json-api-adapter");
    const session = this.owner.lookup("service:session");
    set(session, "session.isAuthenticated", true);
    session.data.authenticated.access_token = "access.token";

    assert.deepEqual(adapter.headers, { Authorization: "Bearer access.token" });
  });

  test("it refreshes the access token before ember-data requests", async function (assert) {
    const adapter = this.owner.lookup("adapter:oidc-json-api-adapter");

    adapter.session.refreshAuthentication.perform = () => {
      assert.step("refresh");
    };

    const mockAndTest = async (funcName) => {
      adapter[funcName] = () => {
        assert.step(funcName);
      };

      await adapter[funcName]();
      assert.verifySteps(["refresh", funcName]);
    };

    await mockAndTest("findRecord");
    await mockAndTest("createRecord");
    await mockAndTest("updateRecord");
    await mockAndTest("deleteRecord");
    await mockAndTest("findAll");
    await mockAndTest("query");
    await mockAndTest("findMany");
  });

  test("it invalidates the session correctly on a 401 response", function (assert) {
    const adapter = this.owner.lookup("adapter:oidc-json-api-adapter");
    const session = adapter.session;
    session.session.content = {};
    session.session.isAuthenticated = true;
    session.invalidate = () => {
      assert.step("invalidate");
    };

    adapter.handleResponse(401, {}, {}, {});

    assert.strictEqual(
      adapter.session.data.nextURL,
      location.href.replace(location.origin, ""),
    );

    assert.verifySteps(["invalidate"]);
  });
});
