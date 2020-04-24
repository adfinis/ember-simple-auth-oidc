import { setupTest } from "ember-qunit";
import getAbsoluteUrl from "ember-simple-auth-oidc/utils/absoluteUrl";
import { module, test } from "qunit";

module("Unit | Utils | absoluteUrl", function (hooks) {
  setupTest(hooks);

  test("it transforms a relative url to an absolute one", function (assert) {
    assert.expect(1);

    const url = "/login";
    assert.equal(
      getAbsoluteUrl(url),
      `${location.protocol}//${location.host}/login`
    );
  });

  test("it does not transform an absolute url", function (assert) {
    assert.expect(1);

    const url = "http://myTestHost/login";
    assert.equal(getAbsoluteUrl(url), url);
  });
});
