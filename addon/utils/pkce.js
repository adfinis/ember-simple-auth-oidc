import base64 from "base64-js";
import { sha256 } from "js-sha256";

// Generate Proof Key for Code Exchange (PKCE, pronounced "pixy"). Based on RFC 7636

export const RANDOM_DATA_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/**
 * Generates a cryptographically safe random string
 * from RANDOM_DATA_ALPHABET with the given length.
 *
 * @param {int} len Length of the PKCE code verifier between 43 and 128.
 * @returns {String} PKCE code verifier
 */
export function generateCodeVerifier(len = 43) {
  const randomData = crypto.getRandomValues(new Uint8Array(len));
  /**
   * cannot use new Array(len).map because map does not work for indexes which have never been set
   * [...new Array(len)].map should work but is not ideal for large arrays
   */
  const chars = new Array(len);
  for (let i = 0; i < len; i++) {
    chars[i] = RANDOM_DATA_ALPHABET.charCodeAt(
      randomData[i] % RANDOM_DATA_ALPHABET.length
    );
  }

  return String.fromCharCode.apply(null, chars);
}

/**
 * Transforms the given PKCE code verifier to the format given by the RFC of
 * BASE64URL-ENCODE(SHA256(ASCII(code_verifier)))
 *
 * @param {String} codeVerifier PKCE code verifier
 * @returns {String} PKCE code challenge
 */
export function generatePkceChallenge(codeVerifier) {
  return base64
    .fromByteArray(new Uint8Array(sha256.arrayBuffer(codeVerifier)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
