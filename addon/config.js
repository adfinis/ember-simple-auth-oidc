import config from "ember-get-config";

export default Object.assign(
  {
    host: "http://localhost:4200",
    clientId: "client",
    authEndpoint: "/protocol/openid-connect/auth",
    tokenEndpoint: "/protocol/openid-connect/token",
    logoutEndpoint: "/protocol/openid-connect/logout",
    userinfoEndpoint: "/protocol/openid-connect/userinfo",
    scope: "openid",
    // expiresIn is the fallback expire time if none is given
    expiresIn: 3600 * 1000,
    refreshLeeway: 1000 * 30,
    tokenPropertyName: "access_token",
    authHeaderName: "Authorization",
    authPrefix: "Bearer"
  },
  config["ember-simple-auth-oidc"] || {}
);
