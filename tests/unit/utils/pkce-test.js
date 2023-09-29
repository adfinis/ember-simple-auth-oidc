import base64 from "base64-js";
import { sha256 } from "js-sha256";
import { module, test } from "qunit";

import {
  generatePkceChallenge,
  generateCodeVerifier,
} from "ember-simple-auth-oidc/utils/pkce";

module("Unit | Utility | pkce", function () {
  test("it generates pkce code challenge correctly", function (assert) {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generatePkceChallenge(codeVerifier);
    assert.deepEqual(
      codeChallenge,
      base64
        .fromByteArray(new Uint8Array(sha256.arrayBuffer(codeVerifier)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, ""),
    );
  });

  test("it generates the pkce code verifier", function (assert) {
    const codeVerifier = generateCodeVerifier(96);
    assert.deepEqual(codeVerifier.length, 96);
  });
});
