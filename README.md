# ember-simple-auth-oidc
[![npm version](https://badge.fury.io/js/ember-simple-auth-oidc.svg)](https://www.npmjs.com/package/ember-simple-auth-oidc)
[![Build Status](https://travis-ci.com/adfinis-sygroup/ember-simple-auth-oidc.svg?branch=master)](https://travis-ci.com/adfinis-sygroup/ember-simple-auth-oidc)
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

The `oidc-end-session-route-mixin` must cover the logout / end session route
(for example `/logout`).

```js
// app/routes/logout.js

import Route from "@ember/routing/route";
import OIDCEndSessionRouteMixin from "ember-simple-auth-oidc/mixins/oidc-end-session-route-mixin";

export default Route.extend(OIDCEndSessionRouteMixin, {});
```

To include authorization info in all Ember Data requests add the `oidc-adapter-mixin`
into the application adapter.

```js
// app/adapters/application.js

import DS from "ember-data";
import OIDCAdapterMixin from "ember-simple-auth-oidc/mixins/oidc-adapter-mixin";

export default DS.JSONAPIAdapter.extend(OIDCAdapterMixin, {});
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
      userinfoEndpoint: "/userinfo",
    }
    // ...
  }
  return ENV;
}
```

Here is a complete list of all possible config options:

**host** \<String\>  
A relative or absolute URI of the authorization server.

**clientId** \<String\>  
The oidc client identifier valid at the authorization server.

**authEndpoint** \<String\>  
Authorization endpoint at the authorization server.

**tokenEndpoint** \<String\>  
Token endpoint at the authorization server.

**endSessionEndpoint** \<String\> (optional)  
End session endpoint at the authorization server. Optional if `oidc-end-session-route-mixin` is not used.

**userinfoEndpoint** \<String\>  
Userinfo endpoint at the authorization server.

**afterLogoutUri** \<String\> (optional)  
A relative or absolute URI to which will be redirected after logout / end session. Optional if
`oidc-end-session-route-mixin` is not used.

**scope** \<String\> (optional)  
The oidc scope value. Default is `openid`.

**expiresIn** \<Number\> (optional)  
Milliseconds after which the token expires. This is only a fallback value if the
authorization server does not return a `expires_in` value. Default is 1 hour.

**refreshLeeway** \<Number\> (optional)  
Milliseconds before expire time at which the token is refreshed. Default is 30 seconds.

**tokenPropertyName** \<String\> (optional)  
Name of the property which holds the token in a successful authenticate request.
Default is `access_token`.

**authHeaderName** \<String\> (optional)  
Name of the authentication header holding the token used in requests.
Default is `Authorization`.

**authPrefix** \<String\> (optional)  
Prefix of the authentication token. Default is `Bearer`.

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

This project is licensed under the [MIT License](LICENSE.md).
