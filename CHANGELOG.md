# [2.0.0](https://github.com/adfinis-sygroup/ember-simple-auth-oidc/compare/v1.1.1...v2.0.0) (2020-06-18)


### Bug Fixes

* **config:** allow configuration URLs to be absolute and relative ([3477cbc](https://github.com/adfinis-sygroup/ember-simple-auth-oidc/commit/3477cbcaab839283fc01beac59f9d9a7e5694493)), closes [#189](https://github.com/adfinis-sygroup/ember-simple-auth-oidc/issues/189)
* **mixin:** correctly recompute `headers` in the `oidc-adapter-mixin` ([d994a6e](https://github.com/adfinis-sygroup/ember-simple-auth-oidc/commit/d994a6e0b6b0ef2fd587989d3bd1d64aaf972a0a))
* **mixin:** restore error handling ([31671f5](https://github.com/adfinis-sygroup/ember-simple-auth-oidc/commit/31671f530d78d980092d77f1fb814f0da9e0be0c))


### chore

* **deps:** update ember and other dependencies ([4d3bad3](https://github.com/adfinis-sygroup/ember-simple-auth-oidc/commit/4d3bad3ecc087b95e9dab9ef43083564d91505e9))


### Features

* add support for ember-simple-auth 3 ([e86f571](https://github.com/adfinis-sygroup/ember-simple-auth-oidc/commit/e86f571aded982619b1c2b147c4b4447d1e519d0))


### BREAKING CHANGES

* **deps:** Support for the old ember LTS 3.8 is dropped

## [1.1.1](https://github.com/adfinis-sygroup/ember-simple-auth-oidc/compare/v1.1.0...v1.1.1) (2020-04-22)


### Bug Fixes

* **mixin:** store id_token for use as id_token_hint on logout ([f6adf36](https://github.com/adfinis-sygroup/ember-simple-auth-oidc/commit/f6adf36deca6bf66e5cd8e780f3d193eab83175a))

# [1.1.0](https://github.com/adfinis-sygroup/ember-simple-auth-oidc/compare/v1.0.0...v1.1.0) (2020-01-22)

### Bug Fixes

- **logout:** prevent overriding continueTransition if it's already set ([5080a03](https://github.com/adfinis-sygroup/ember-simple-auth-oidc/commit/5080a03bb0f9a124905b9fbefe58ba6a6e72256a))

### Features

- add function to handle unauthorized responses ([5d131c3](https://github.com/adfinis-sygroup/ember-simple-auth-oidc/commit/5d131c37b9ce9abdc31641dc6d9dd43e7e30b931))

# [1.0.0](https://github.com/adfinis-sygroup/ember-simple-auth-oidc/compare/v0.4.3...v1.0.0) (2020-01-22)

### Bug Fixes

- **adapter:** remove deprecated usage of authorize on adapter mixin ([fdd3de4](https://github.com/adfinis-sygroup/ember-simple-auth-oidc/commit/fdd3de4df98c00998d192517e60c1e6b642b1fcb))

### Features

- remove support for node 8 ([9cc76a4](https://github.com/adfinis-sygroup/ember-simple-auth-oidc/commit/9cc76a4691fea05a3fb1d05bb03f094d5c9761af))
- store redirect URL before logout ([9ae445e](https://github.com/adfinis-sygroup/ember-simple-auth-oidc/commit/9ae445e76d7dbba7a968cd99f4b2d13c8ff9c1d0))
- **license:** move from MIT to LGPL-3.0-or-later license ([ce3e635](https://github.com/adfinis-sygroup/ember-simple-auth-oidc/commit/ce3e6356936243bb3dc86ba0b89cb4f57a365124))

### BREAKING CHANGES

- **license:** This project is now licensed under the LGPL-3.0-or-later
  license instead of the MIT license.
- This removes the need for the `OIDCEndSessionRouteMixin`. It can simply be replaced by the ESA native call of `session.invalidate()`

This enables the user to store the source URL after logging out. The user will then be redirected to that source after the next login.

- Node version 8.x is not supported anymore since it's
  not a maintained LTS version.

## [0.4.3](https://github.com/adfinis-sygroup/ember-simple-auth-oidc/compare/v0.4.2...v0.4.3) (2019-10-04)

### Changes

- **dependencies:** update dependencies

## [0.4.2](https://github.com/adfinis-sygroup/ember-simple-auth-oidc/compare/v0.4.1...v0.4.2) (2019-09-09)

### Bug Fixes

- **authenticator:** await successful retry before setting the session ([18b9c1f](https://github.com/adfinis-sygroup/ember-simple-auth-oidc/commit/18b9c1f))

## [0.4.1](https://github.com/adfinis-sygroup/ember-simple-auth-oidc/compare/v0.4.0...v0.4.1) (2019-09-06)

### Bug Fixes

- **authenticator:** retry token refresh on error ([63cd8d3](https://github.com/adfinis-sygroup/ember-simple-auth-oidc/commit/63cd8d3))

# [0.4.0](https://github.com/adfinis-sygroup/ember-simple-auth-oidc/compare/v0.3.0...v0.4.0) (2019-07-25)

### Bug Fixes

- **continue-transition:** do not trigger intercepted transition twice ([1fafa76](https://github.com/adfinis-sygroup/ember-simple-auth-oidc/commit/1fafa76))
- **dummy-app:** fix queryParams handling in dummy ([76ab8ef](https://github.com/adfinis-sygroup/ember-simple-auth-oidc/commit/76ab8ef))

### Features

- **redirect:** add support for login_hint ([9074063](https://github.com/adfinis-sygroup/ember-simple-auth-oidc/commit/9074063))

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
