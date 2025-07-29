import { getOwner } from "@ember/application";
import Service from "@ember/service";
import { tracked } from "@glimmer/tracking";
import { lastValue, task } from "ember-concurrency";
import { cached } from "tracked-toolbox";

const defaultConfig = {
  host: "http://localhost:4200",
  clientId: "client",
  authEndpoint: null,
  tokenEndpoint: null,
  endSessionEndpoint: null,
  afterLogoutUri: null,
  userinfoEndpoint: null,
  scope: "openid",
  expiresIn: 3600 * 1000,
  refreshLeeway: 1000 * 30,
  tokenPropertyName: "access_token",
  authHeaderName: "Authorization",
  authPrefix: "Bearer",
  amountOfRetries: 3,
  retryTimeout: 3000,
  enablePkce: false,
  unauthorizedRequestRedirectTimeout: 1000,
};

const aliases = {
  authEndpoint: "authorizationEndpoint",
};

export const applyAliases = (config) => {
  Object.entries(aliases).forEach(([key, alias]) => {
    config[alias] = config[key];
  });

  return config;
};

export const camelize = (s) => s.replace(/_./g, (x) => x[1].toUpperCase());

export const camelizeObjectKeys = (obj) =>
  Object.entries(obj).reduce((newObj, [key, value]) => {
    newObj[camelize(key)] = value;
    return newObj;
  }, {});

export default class ConfigurationService extends Service {
  @tracked resolvedConfig;

  constructor(...args) {
    super(...args);

    const envConfig =
      getOwner(this).resolveRegistration("config:environment")[
        "ember-simple-auth-oidc"
      ];
    if (envConfig) {
      this.resolvedConfig = applyAliases(camelizeObjectKeys(envConfig));
    }

    this.configKeys.forEach((key) => {
      Object.defineProperty(this, key, {
        get() {
          return this.configuration[key];
        },
      });
    });
  }

  @cached
  get configuration() {
    return { ...defaultConfig, ...this.resolvedConfig, ...this.fetchedConfig };
  }

  @cached
  get configKeys() {
    return Object.keys(defaultConfig);
  }

  get hasEndpointsConfigured() {
    return (
      Boolean(this.configuration?.tokenEndpoint) &&
      Boolean(this.configuration?.userinfoEndpoint)
    );
  }

  async loadConfig() {
    if (!this.hasEndpointsConfigured) {
      await this._fetchAuthConfiguration.perform();
    }
  }

  /**
   * Tries to fetch the OIDC provider configuration from the specified host/realm.
   * SPEC: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfig
   */
  @lastValue("_fetchAuthConfiguration") fetchedConfig;
  _fetchAuthConfiguration = task(async () => {
    if (this._fetchAuthConfiguration.lastSuccessful) {
      return this.fetchedConfig;
    }

    if (!this.host) {
      throw new Error("Please define a OIDC host.");
    }

    const wellKnownUrl = `${this.host}/.well-known/openid-configuration`;
    const response = await fetch(wellKnownUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch OIDC configuration from ${wellKnownUrl}. Status: ${response.status} ${response.statusText}`,
      );
    }

    const json = await response.json();

    return applyAliases(camelizeObjectKeys(json.data));
  });
}
