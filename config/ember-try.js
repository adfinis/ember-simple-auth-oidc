"use strict";

const getChannelURL = require("ember-source-channel-url");

module.exports = function() {
  return Promise.all([
    getChannelURL("release"),
    getChannelURL("beta"),
    getChannelURL("canary")
  ]).then(urls => {
    return {
      useYarn: true,
      scenarios: [
        {
          name: "ember-lts-3.4",
          env: {
            EMBER_OPTIONAL_FEATURES: JSON.stringify({
              "jquery-integration": true
            })
          },
          npm: {
            devDependencies: {
              "ember-source": "~3.4.0"
            }
          }
        },
        {
          name: "ember-lts-3.8",
          env: {
            EMBER_OPTIONAL_FEATURES: JSON.stringify({
              "jquery-integration": true
            })
          },
          npm: {
            devDependencies: {
              "@ember/jquery": "^0.6.0",
              "ember-source": "~3.8.0"
            }
          }
        },
        {
          name: "ember-release",
          npm: {
            devDependencies: {
              "@ember/jquery": "^0.6.0",
              "ember-source": urls[0]
            }
          }
        },
        {
          name: "ember-beta",
          npm: {
            devDependencies: {
              "@ember/jquery": "^0.6.0",
              "ember-source": urls[1]
            }
          }
        },
        {
          name: "ember-canary",
          npm: {
            devDependencies: {
              "@ember/jquery": "^0.6.0",
              "ember-source": urls[2]
            }
          }
        },
        // The default `.travis.yml` runs this scenario via `npm test`,
        // not via `ember try`. It's still included here so that running
        // `ember try:each` manually or from a customized CI config will run it
        // along with all the other scenarios.
        {
          name: "ember-default",
          npm: {
            devDependencies: {}
          }
        },
        {
          name: "ember-default-with-jquery",
          env: {
            EMBER_OPTIONAL_FEATURES: JSON.stringify({
              "jquery-integration": true
            })
          },
          npm: {
            devDependencies: {
              "@ember/jquery": "^0.6.0"
            }
          }
        }
      ]
    };
  });
};
