## [5.0.3](https://github.com/adfinis/ember-simple-auth-oidc/compare/v5.0.2...v5.0.3) (2023-03-22)


### Bug Fixes

* prevent redirect loops to login route ([4e5d909](https://github.com/adfinis/ember-simple-auth-oidc/commit/4e5d909f53a11d4d3be2c4ef2c025051a04129b1))

## [5.0.2](https://github.com/adfinis/ember-simple-auth-oidc/compare/v5.0.1...v5.0.2) (2023-03-16)


### Bug Fixes

* always reconnect on unauthorized responses ([4a2f0a6](https://github.com/adfinis/ember-simple-auth-oidc/commit/4a2f0a6d29cb4900fe0c52a4cb76c7e2fd8174dc))

## [5.0.1](https://github.com/adfinis/ember-simple-auth-oidc/compare/v5.0.0...v5.0.1) (2022-10-20)


### Bug Fixes

* **apollo:** make apollo client a dependency ([31aca2e](https://github.com/adfinis/ember-simple-auth-oidc/commit/31aca2e7ff849d1d7e467d0a6f3eb1609c88ce7c)), closes [#597](https://github.com/adfinis/ember-simple-auth-oidc/issues/597)

# [5.0.0](https://github.com/adfinis/ember-simple-auth-oidc/compare/v4.1.1...v5.0.0) (2022-09-02)


### chore

* **deps:** update dependencies ([2c298f5](https://github.com/adfinis/ember-simple-auth-oidc/commit/2c298f5015e8090ae3eb6641873a970a9b9f27cf))


### Features

* add pkce generation ([e9bbfc3](https://github.com/adfinis/ember-simple-auth-oidc/commit/e9bbfc38e699e8af10ff81bf0c86420a8e1aa341))


### BREAKING CHANGES

* **deps:** Drop support for Node v12 and Ember LTS v3.24.

## [4.1.1](https://github.com/adfinis/ember-simple-auth-oidc/compare/v4.1.0...v4.1.1) (2022-04-28)

### Bug Fixes

- **auth-route:** store query params of attempted transition ([4a8406d](https://github.com/adfinis/ember-simple-auth-oidc/commit/4a8406d2f8db68d8b7f2f39912232a243bc81dbe))

# [4.1.0](https://github.com/adfinis/ember-simple-auth-oidc/compare/v4.0.0...v4.1.0) (2022-03-22)

### Features

- **apollo:** add middleware for ember-apollo-client ([7e22f17](https://github.com/adfinis/ember-simple-auth-oidc/commit/7e22f17172d02df77a8390013cabf81ab9cbc04e))

# [4.0.0](https://github.com/adfinis/ember-simple-auth-oidc/compare/v3.0.1...v4.0.0) (2022-02-04)

### Bug Fixes

- **authentication:** fix collection of attempted transition url ([503a0d5](https://github.com/adfinis/ember-simple-auth-oidc/commit/503a0d5eb0efe0e2f3ba5fad556237cb8b386cfd))
- **config:** remove usage of ember-get-config ([74a9c0d](https://github.com/adfinis/ember-simple-auth-oidc/commit/74a9c0de5fed30dbedd966e19e8059f9d7699ea9))
- **debug:** remove console log statements ([eb3af4b](https://github.com/adfinis/ember-simple-auth-oidc/commit/eb3af4b983f45805c57cdc21a5675367057e993a))
- **dummy:** correct session setup and fix serializer deprecation ([aae998d](https://github.com/adfinis/ember-simple-auth-oidc/commit/aae998da253c7edfe24abcabf242630d816fe5e3))
- **lint:** add missing linter deps and fix linting errors ([d21c18e](https://github.com/adfinis/ember-simple-auth-oidc/commit/d21c18e6b867aedd7d6f28c3b0d4c0aad2bf2c0e))
- minor fixes and requested changes ([28a67ac](https://github.com/adfinis/ember-simple-auth-oidc/commit/28a67ac9ef8ffdfe7a6906659e3e02ebaad586ce))

- feat(adapter)!: add oidc rest adapter and refactor adapter naming ([2c9f446](https://github.com/adfinis/ember-simple-auth-oidc/commit/2c9f4466a4e36d25c49395e131719cb9b61e8d5d))
- refactor(octane)!: refactor to native js classes and remove mixins ([b3610e8](https://github.com/adfinis/ember-simple-auth-oidc/commit/b3610e824df94fcf2bd008d9deb96b6ae48b6aa2))

### BREAKING CHANGES

- Include an adapter subclass of the Ember
  RestAdapter to handle OIDC token refreshes and unauthorized
  request handling. The existing OIDCadapter is renamed to
  OIDCJSONAPIAdapter to clarify the base class origin.
- mixins can no longer be used, requires migration
  of consuming ember applications.

# [4.0.0-beta.2](https://github.com/adfinis/ember-simple-auth-oidc/compare/v4.0.0-beta.1...v4.0.0-beta.2) (2022-02-04)

### Bug Fixes

- **config:** remove usage of ember-get-config ([74a9c0d](https://github.com/adfinis/ember-simple-auth-oidc/commit/74a9c0de5fed30dbedd966e19e8059f9d7699ea9))

# [4.0.0-beta.1](https://github.com/adfinis/ember-simple-auth-oidc/compare/v3.0.1...v4.0.0-beta.1) (2022-01-11)

### Bug Fixes

- **authentication:** fix collection of attempted transition url ([503a0d5](503a0d5))
- **debug:** remove console log statements ([eb3af4b](eb3af4b))
- **dummy:** correct session setup and fix serializer deprecation ([aae998d](aae998d))
- **lint:** add missing linter deps and fix linting errors ([d21c18e](d21c18e))
- minor fixes and requested changes ([28a67ac](28a67ac))

- feat(adapter)!: add oidc rest adapter and refactor adapter naming ([2c9f446](2c9f446))
- refactor(octane)!: refactor to native js classes and remove mixins ([b3610e8](b3610e8))

### BREAKING CHANGES

- Include an adapter subclass of the Ember
  RestAdapter to handle OIDC token refreshes and unauthorized
  request handling. The existing OIDCadapter is renamed to
  OIDCJSONAPIAdapter to clarify the base class origin.
- mixins can no longer be used, requires migration
  of consuming ember applications.

## [3.0.1](https://github.com/adfinis/ember-simple-auth-oidc/compare/v3.0.0...v3.0.1) (2020-11-19)

### Bug Fixes

- **deps:** update ember and other dependencies ([c911827](https://github.com/adfinis/ember-simple-auth-oidc/commit/c911827779b323f3ad9b3181e6d2911eec133e49))

# [3.0.0](https://github.com/adfinis/ember-simple-auth-oidc/compare/v2.0.0...v3.0.0) (2020-08-18)

### Features

- **single-logout:** separate session invalidate and oidc logout ([628eecb](https://github.com/adfinis/ember-simple-auth-oidc/commit/628eecb77a518122b5c877cccf4fed2bcf279530))

### BREAKING CHANGES

- **single-logout:** Since v1.0.0 this addon will always perform a single
  logout on the authorization server. With this change the default
  behaviour is "only" a logout on the current application. If the single
  logout should be preserved the consuming application needs to manually
  call the new `singleLogout` function.

# [2.0.0](https://github.com/adfinis/ember-simple-auth-oidc/compare/v1.1.1...v2.0.0) (2020-06-18)

### Bug Fixes

- **config:** allow configuration URLs to be absolute and relative ([3477cbc](https://github.com/adfinis/ember-simple-auth-oidc/commit/3477cbcaab839283fc01beac59f9d9a7e5694493)), closes [#189](https://github.com/adfinis/ember-simple-auth-oidc/issues/189)
- **mixin:** correctly recompute `headers` in the `oidc-adapter-mixin` ([d994a6e](https://github.com/adfinis/ember-simple-auth-oidc/commit/d994a6e0b6b0ef2fd587989d3bd1d64aaf972a0a))
- **mixin:** restore error handling ([31671f5](https://github.com/adfinis/ember-simple-auth-oidc/commit/31671f530d78d980092d77f1fb814f0da9e0be0c))

### chore

- **deps:** update ember and other dependencies ([4d3bad3](https://github.com/adfinis/ember-simple-auth-oidc/commit/4d3bad3ecc087b95e9dab9ef43083564d91505e9))

### Features

- add support for ember-simple-auth 3 ([e86f571](https://github.com/adfinis/ember-simple-auth-oidc/commit/e86f571aded982619b1c2b147c4b4447d1e519d0))

### BREAKING CHANGES

- **deps:** Support for the old ember LTS 3.8 is dropped

## [1.1.1](https://github.com/adfinis/ember-simple-auth-oidc/compare/v1.1.0...v1.1.1) (2020-04-22)

### Bug Fixes

- **mixin:** store id_token for use as id_token_hint on logout ([f6adf36](https://github.com/adfinis/ember-simple-auth-oidc/commit/f6adf36deca6bf66e5cd8e780f3d193eab83175a))

# [1.1.0](https://github.com/adfinis/ember-simple-auth-oidc/compare/v1.0.0...v1.1.0) (2020-01-22)

### Bug Fixes

- **logout:** prevent overriding continueTransition if it's already set ([5080a03](https://github.com/adfinis/ember-simple-auth-oidc/commit/5080a03bb0f9a124905b9fbefe58ba6a6e72256a))

### Features

- add function to handle unauthorized responses ([5d131c3](https://github.com/adfinis/ember-simple-auth-oidc/commit/5d131c37b9ce9abdc31641dc6d9dd43e7e30b931))

# [1.0.0](https://github.com/adfinis/ember-simple-auth-oidc/compare/v0.4.3...v1.0.0) (2020-01-22)

### Bug Fixes

- **adapter:** remove deprecated usage of authorize on adapter mixin ([fdd3de4](https://github.com/adfinis/ember-simple-auth-oidc/commit/fdd3de4df98c00998d192517e60c1e6b642b1fcb))

### Features

- remove support for node 8 ([9cc76a4](https://github.com/adfinis/ember-simple-auth-oidc/commit/9cc76a4691fea05a3fb1d05bb03f094d5c9761af))
- store redirect URL before logout ([9ae445e](https://github.com/adfinis/ember-simple-auth-oidc/commit/9ae445e76d7dbba7a968cd99f4b2d13c8ff9c1d0))
- **license:** move from MIT to LGPL-3.0-or-later license ([ce3e635](https://github.com/adfinis/ember-simple-auth-oidc/commit/ce3e6356936243bb3dc86ba0b89cb4f57a365124))

### BREAKING CHANGES

- **license:** This project is now licensed under the LGPL-3.0-or-later
  license instead of the MIT license.
- This removes the need for the `OIDCEndSessionRouteMixin`. It can simply be replaced by the ESA native call of `session.invalidate()`

This enables the user to store the source URL after logging out. The user will then be redirected to that source after the next login.

- Node version 8.x is not supported anymore since it's
  not a maintained LTS version.

## [0.4.3](https://github.com/adfinis/ember-simple-auth-oidc/compare/v0.4.2...v0.4.3) (2019-10-04)

### Changes

- **dependencies:** update dependencies

## [0.4.2](https://github.com/adfinis/ember-simple-auth-oidc/compare/v0.4.1...v0.4.2) (2019-09-09)

### Bug Fixes

- **authenticator:** await successful retry before setting the session ([18b9c1f](https://github.com/adfinis/ember-simple-auth-oidc/commit/18b9c1f))

## [0.4.1](https://github.com/adfinis/ember-simple-auth-oidc/compare/v0.4.0...v0.4.1) (2019-09-06)

### Bug Fixes

- **authenticator:** retry token refresh on error ([63cd8d3](https://github.com/adfinis/ember-simple-auth-oidc/commit/63cd8d3))

# [0.4.0](https://github.com/adfinis/ember-simple-auth-oidc/compare/v0.3.0...v0.4.0) (2019-07-25)

### Bug Fixes

- **continue-transition:** do not trigger intercepted transition twice ([1fafa76](https://github.com/adfinis/ember-simple-auth-oidc/commit/1fafa76))
- **dummy-app:** fix queryParams handling in dummy ([76ab8ef](https://github.com/adfinis/ember-simple-auth-oidc/commit/76ab8ef))

### Features

- **redirect:** add support for login_hint ([9074063](https://github.com/adfinis/ember-simple-auth-oidc/commit/9074063))

# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/)
and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.2.0] - 2019-02-04

### Changed

- Remove `realm` part as this is keycloak and not OIDC specific. In the case
  of a keycloak implementation, the `realm` should be part of the `host`.
  This change is not backwards compatible! Just remove the `realm` property
  from your configuration and add it directly to the `host` property.
- Add required config option `scope` as scope is required by OIDC standard and
  is now always delivered to the auth endpoint
- Add required config option `userinfoEndpoint`
- Add optional config option `expiresIn`
- Remove default values for all endpoint config options. They need to be set
  specifically in the project config file.
- No longer parse the `access_token` for user information instead request the
  user information from the userinfo endpoint. Make sure the userinfo endpoint
  is available and correctly configured!
- Use the `expires_in` time from the token endpoint if available otherwise
  fallback to the config `expiresIn` value.
