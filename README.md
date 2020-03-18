# ember-simple-auth-oidc

[![npm version](https://badge.fury.io/js/ember-simple-auth-oidc.svg)](https://www.npmjs.com/package/ember-simple-auth-oidc)
[![Test](https://github.com/adfinis-sygroup/ember-simple-auth-oidc/workflows/Test/badge.svg?branch=master)](https://github.com/adfinis-sygroup/ember-simple-auth-oidc/actions?query=workflow%3ATest)
[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

A [Ember Simple Auth](http://ember-simple-auth.com) addon which implements the
OpenID Connect [Authorization Code Flow](https://openid.net/specs/openid-connect-core-1_0.html#CodeFlowAuth).

## Installation

```bash
$ ember install ember-simple-auth-oidc
```

## Usage

To use the oidc authorization code flow add at least the following mixins to
their respective routes:

The `oidc-application-route-mixin` replaces the Ember Simple Auth `application-route-mixin`.

```js
// app/routes/application.js

import Route from "@ember/routing/route";
import OIDCApplicationRouteMixin from "ember-simple-auth-oidc/mixins/oidc-application-route-mixin";

export default Route.extend(OIDCApplicationRouteMixin, {});
```

The `oidc-authentication-route-mixin` must cover the login / authentication route
(for example the Ember Simple Auth default `/login`).

```js
// app/routes/login.js

import Route from "@ember/routing/route";
import OIDCAuthenticationRouteMixin from "ember-simple-auth-oidc/mixins/oidc-authentication-route-mixin";

export default Route.extend(OIDCAuthenticationRouteMixin, {});
```

To include authorization info in all Ember Data requests add the `oidc-adapter-mixin`
into the application adapter.

```js
// app/adapters/application.js

import DS from "ember-data";
import OIDCAdapterMixin from "ember-simple-auth-oidc/mixins/oidc-adapter-mixin";

export default DS.JSONAPIAdapter.extend(OIDCAdapterMixin, {});
```

This mixin already handles unauthorized requests and performs an invalidation
of the session which also remembers your visited URL. If you want this
behaviour for other request services as well, you can use the
`handleUnauthorized` function. The following snippet shows an example
`ember-apollo-client` afterware (error handling) implementation:

```js
// app/services/apollo.js

import { inject as service } from "@ember/service";
import { onError } from "apollo-link-error";
import ApolloService from "ember-apollo-client/services/apollo";
import { handleUnauthorized } from "ember-simple-auth-oidc";

export default ApolloService {
  session: service(),

  link() {
    const httpLink = this._super(...arguments);

    const afterware = onError(error => {
      const { networkError } = error;

      if (networkError.statusCode === 401) {
        handleUnauthorized(this.session);
      }
    });

    return afterware.concat(httpLink);
  }
});
```

## Configuration

The addon can be configured in the project's `environment.js` file with the key `ember-simple-auth-oidc`.

A minimal configuration includes the following options:

```js
// config/environment.js

module.exports = function(environment) {
  let ENV = {
    // ...
    "ember-simple-auth-oidc": {
      host: "http://authorization.server/openid",
      clientId: "test",
      authEndpoint: "/authorize",
      tokenEndpoint: "/token",
      userinfoEndpoint: "/userinfo"
    }
    // ...
  };
  return ENV;
};
```

Here is a complete list of all possible config options:

**host** `<String>`  
A relative or absolute URI of the authorization server.

**clientId** `<String>`  
The oidc client identifier valid at the authorization server.

**authEndpoint** `<String>`  
Authorization endpoint at the authorization server.

**tokenEndpoint** `<String>`  
Token endpoint at the authorization server.

**endSessionEndpoint** `<String>` (optional)  
End session endpoint at the authorization server.

**userinfoEndpoint** `<String>`  
Userinfo endpoint at the authorization server.
Can be a URL (SSL required) or a path of the `host`.

**afterLogoutUri** `<String>` (optional)  
A relative or absolute URI to which will be redirected after logout / end session.

**scope** `<String>` (optional)  
The oidc scope value. Default is `"openid"`.

**expiresIn** `<Number>` (optional)  
Milliseconds after which the token expires. This is only a fallback value if the authorization server does not return a `expires_in` value. Default is `3600000` (1h).

**refreshLeeway** `<Number>` (optional)  
Milliseconds before expire time at which the token is refreshed. Default is `30000` (30s).

**tokenPropertyName** `<String>` (optional)  
Name of the property which holds the token in a successful authenticate request. Default is `"access_token"`.

**authHeaderName** `<String>` (optional)  
Name of the authentication header holding the token used in requests. Default is `"Authorization"`.

**authPrefix** `<String>` (optional)  
Prefix of the authentication token. Default is `"Bearer"`.

**loginHintName** `<String>` (optional)  
Name of the `login_hint` query paramter which is being forwarded to the authorization server if it is present. This option allows overriding the default name `login_hint`.

**amountOfRetries** `<Number>` (optional)  
Amount of retries should be made if the request to fetch a new token fails. Default is `3`.

**retryTimeout** `<Number>` (optional)  
Timeout in milliseconds between each retry if a token refresh should fail. Default is `3000`.

## Contributing

### Installation

- `git clone <repository-url>`
- `cd ember-simple-auth-oidc`
- `yarn install`

### Linting

- `yarn lint:js`
- `yarn lint:js --fix`

### Running tests

- `ember test` – Runs the test suite on the current Ember version
- `ember test --server` – Runs the test suite in "watch mode"
- `ember try:each` – Runs the test suite against multiple Ember versions

### Running the dummy application

- `ember serve`
- Visit the dummy application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).

## License

This project is licensed under the [LGPL-3.0-or-later license](LICENSE).
