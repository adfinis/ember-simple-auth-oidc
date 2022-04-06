import { getOwner } from "@ember/application";

export function getConfig(owner) {
  return {
    host: "http://localhost:4200",
    clientId: "client",
    authEndpoint: null,
    tokenEndpoint: null,
    endSessionEndpoint: null,
    afterLogoutUri: null,
    userinfoEndpoint: null,
    scope: "openid",
    // expiresIn is the fallback expire time if none is given
    expiresIn: 3600 * 1000,
    refreshLeeway: 1000 * 30,
    tokenPropertyName: "access_token",
    authHeaderName: "Authorization",
    authPrefix: "Bearer",
    amountOfRetries: 3,
    retryTimeout: 3000,
    enablePkce: false,
    ...(owner.resolveRegistration("config:environment")[
      "ember-simple-auth-oidc"
    ] ?? {}),
  };
}

export default function config() {
  return {
    get() {
      return getConfig(getOwner(this));
    },
  };
}
