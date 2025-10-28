"use strict";

module.exports = function (environment) {
  const ENV = {
    modulePrefix: "dummy",
    environment,
    rootURL: "/",
    locationType: "history",
    apollo: {
      apiURL: "http://localhost:4200/graphql",
    },
    "ember-simple-auth-oidc": {
      host: "http://localhost:4200/realms/test-realm",
      clientId: "test-client",
      authEndpoint: "/protocol/openid-connect/auth",
      tokenEndpoint: "/protocol/openid-connect/token",
      endSessionEndpoint: "/protocol/openid-connect/logout",
      userinfoEndpoint: "/protocol/openid-connect/userinfo",
      afterLoginUri: "/",
      afterLogoutUri: "/",
      loginHintName: "custom_login_hint",
      expiresIn: 60000, // Short expire time (60s) for testing purpose
      refreshLeeway: 1000,
      forceAutodiscovery: false,
      authEndpointParameters: { acr_values: "1,2" },
    },

    EmberENV: {
      EXTEND_PROTOTYPES: false,
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. EMBER_NATIVE_DECORATOR_SUPPORT: true
      },
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },
  };

  if (environment === "development") {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === "test") {
    // Testem prefers this...
    ENV.locationType = "none";

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = "#ember-testing";
    ENV.APP.autoboot = false;
  }

  if (environment === "production") {
    // here you can enable a production-specific feature
  }

  return ENV;
};
