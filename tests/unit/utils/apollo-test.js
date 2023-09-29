import setupMirage from "ember-cli-mirage/test-support/setup-mirage";
import { setupTest } from "ember-qunit";
import { authenticateSession } from "ember-simple-auth/test-support";
import { gql } from "graphql-tag";
import { module, test } from "qunit";

module("Unit | apollo", function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.apollo = this.owner.lookup("service:apollo");
    await authenticateSession({ access_token: "test" });
  });

  test("it handles authorization", async function (assert) {
    this.server.post(
      "/graphql",
      (_, request) => {
        assert.strictEqual(request.requestHeaders.authorization, "Bearer test");
        return { data: { foo: 1 } };
      },
      200,
    );

    const response = await this.apollo.query({
      query: gql`
        query {
          foo
        }
      `,
    });

    assert.strictEqual(response.foo, 1);
  });

  test("it handles 401 errors", async function (assert) {
    this.server.post("/graphql", {}, 401);

    try {
      await this.apollo.query({
        query: gql`
          query {
            foo
          }
        `,
      });
    } catch {
      assert.false(this.owner.lookup("service:session").isAuthenticated);
    }
  });
});
