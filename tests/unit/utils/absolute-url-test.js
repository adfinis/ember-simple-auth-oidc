import { setupTest } from "ember-qunit";
import { module, test } from "qunit";

import getAbsoluteUrl from "ember-simple-auth-oidc/utils/absolute-url";

module("Unit | Utils | absoluteUrl", function (hooks) {
  setupTest(hooks);

  test("it transforms a relative url to an absolute one", function (assert) {
    const url = "/login";
    const host = "https://myTestHost";

    assert.strictEqual(
      getAbsoluteUrl(url),
      `${location.protocol}//${location.host}/login`,
    );

    assert.strictEqual(getAbsoluteUrl(url, host), `${host}/login`);
  });

  test("it does not transform an absolute url", function (assert) {
    const url = "http://myTestHost/login";
    assert.strictEqual(getAbsoluteUrl(url), url);

    const urlSSL = "https://myTestHost/login";
    assert.strictEqual(getAbsoluteUrl(urlSSL), urlSSL);
  });
});
