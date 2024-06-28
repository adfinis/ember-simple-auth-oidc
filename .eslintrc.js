"use strict";
module.exports = {
  extends: ["@adfinis/eslint-config/ember-addon"],
  settings: {
    "import/internal-regex": "^ember-simple-auth-oidc/",
  },
  rules: {
    "ember/no-runloop": "warn",
  },
};
