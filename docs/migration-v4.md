# Migration to v4

ember-simple-auth-oidc v4 includes an upgrade to Ember v4 and Ember Simple
Auth v4, which entails the removal of the deprecated usage of mixins. This
results in a number of breaking changes, which are described in the following
sections. Refer to the [Ember Simple Auth](https://github.com/simplabs/ember-simple-auth)
and [Ember v4](https://blog.emberjs.com/the-road-to-ember-4-0/) documentation
for more information.

In addition, the access token is no longer refreshed through a timer-based
approach and requires an explicit refresh to ensure that the access token
hasn't expired. Although a refresh is ensured by the addon in certain
scenarios, the consuming application needs to be aware of these behavioral
changes, especially when performing authorized requests.

## Mixin removal and replacement

The mixin `AuthenticatedRouteMixin` from Ember Simple Auth should no longer be
used. Instead, authenticated routes can make use of the method `session.requireAuthentication`
of the session service. It ensures that unauthenticated access is prohibited on
the route and any of its subroutes, in which case the user is redirected to the
specified authentication route. If the access is authenticated, it refreshes
the access token before accessing the authenticated route.

```diff
  // app/routes/protected.js

  import Route from "@ember/routing/route";
- import AuthenticatedRouteMixin from "ember-simple-auth/mixins/authenticated-route-mixin";
+ import { service } from "@ember/service";

- export default class ProtectedRoute extends Route.extend(
-   AuthenticatedRouteMixin
- ) {}
+ export default class ProtectedRoute extends Route {
+   @service session;
+
+   beforeModel(transition) {
+     this.session.requireAuthentication(transition, "login");
+   }
+ }
```

The `OIDCApplicationRouteMixin` is no longer needed, it's functionality is now
handled through the session service. The mixin and the properties
`routeAfterAuthentication` and `routeIfAlreadyAuthenticated` can be removed.

```diff
  // app/routes/application.js

  import Route from "@ember/routing/route";
- import OIDCApplicationRouteMixin from "ember-simple-auth-oidc/mixins/oidc-application-route-mixin";

- export default class ApplicationRoute extends Route.extend(
-   OIDCApplicationRouteMixin
- ) {
-   routeAfterAuthentication = "protected";
-   routeIfAlreadyAuthenticated = "protected";
+ export default class ApplicationRoute extends Route {}
```

Instead of using the `OIDCAuthenticationRouteMixin`, the authentication
route should extend from the `OIDCAuthenticationRoute`. It handles the OIDC
authentication process as before and ensures that access to the route is
prohibited to already authenticated users.

```diff
  // app/routes/login.js

- import Route from "@ember/routing/route";
- import OIDCAuthenticationRouteMixin from "ember-simple-auth-oidc/mixins/oidc-authentication-route-mixin";
+ import OIDCAuthenticationRoute from "ember-simple-auth-oidc/routes/oidc-authentication";

- export default class LoginRoute extends Route.extend(
-   OIDCAuthenticationRouteMixin
- ) {}
+ export default class LoginRoute extends OIDCAuthenticationRoute {}
```

The mixin `OIDCAdapterMixin` is no longer needed and can be replaced by either
extending the application adapter from the `OIDCJSONAPIAdapter` or
`OIDCRESTAdapter`. The provided adapters ensure that outgoing Ember Data
requests first trigger an access token refresh, to ensure that the authorization
token is up-to-date. By default, the adapters simply provide the authorization
headers necessary to authorize the Ember Data requests. The headers are also
available through the session service and can be used when overriding the
adapter's headers. The provided adapters contain the necessary logic to handle
401 responses appropriately.

```diff
  // app/adapters/application.js

- import JSONAPIAdapter from "@ember-data/adapter/json-api";
- import OIDCAdapterMixin from "ember-simple-auth-oidc/mixins/oidc-adapter-mixin";
+ import { service } from "@ember/service";
+ import OIDCJSONAPIAdapter from "ember-simple-auth-oidc/adapters/oidc-json-api-adapter";

- export default class ApplicationAdapter extends JSONAPIAdapter.extend(
-   OIDCAdapterMixin
- ) {}
+ export default class ApplicationAdapter extends OIDCJSONAPIAdapter {
+   @service session;
+
+   get headers() {
+     return { ...this.session.headers, "Content-Language": "en-us" };
+   }
+ }
```

## Session setup

Ember Simple Auth encourages setting up the session service in the `beforeModel`
of the application route starting with [version 4.1.0](https://github.com/simplabs/ember-simple-auth/releases/tag/4.1.0).
For more information visit their [upgrade to v4 guide](https://github.com/simplabs/ember-simple-auth/blob/master/guides/upgrade-to-v4.md).

## Proxy usage and IE11 support

The new implementation of `OIDCJSONAPIAdapter` and `OIDCRESTAdapter` include
the usage of [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
to ensure that an access token refresh is performed before issuing Ember Data
requests. When using these adapters and requiring IE11 support, a polyfill needs
to be provided.

## Access token refresh

Previous implementations included a timer-based access token refresh mechanism,
which ensured that the access token never expired as long as a valid refresh
token was available. The new implementation automatically refreshes the access
token before transitioning to an authenticated route and before issuing Ember
Data requests. When other kinds of authorized requests are performed, a token
refresh needs to be ensured before making the request, by performing the task
`session.refreshAuthentication` provided through the session service. This will
ensure that the access token is valid and will prevent any unnecessary 401
responses.
