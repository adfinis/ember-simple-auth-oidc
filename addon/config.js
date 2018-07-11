import config from "ember-get-config";

export default Object.assign(
  {
    host: "http://localhost:4200",
    clientId: "client",
    realm: "realm",
    authEndpoint: "/protocol/openid-connect/auth",
    tokenEndpoint: "/protocol/openid-connect/token",
    logoutEndpoint: "/protocol/openid-connect/logout",
    refreshLeeway: 1000 * 30,
    tokenProperty: "access_token",
    authHeaderName: "Authorization",
    authPrefix: "Bearer"
  },
  config["ember-simple-auth-oidc"] || {}
);
