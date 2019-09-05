import config from "ember-get-config";

export default Object.assign(
  {
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
    retryTimeout: 3000
  },
  config["ember-simple-auth-oidc"] || {}
);
