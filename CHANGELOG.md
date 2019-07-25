# [0.4.0](https://github.com/adfinis-sygroup/ember-simple-auth-oidc/compare/v0.3.0...v0.4.0) (2019-07-25)


### Bug Fixes

* **continue-transition:** do not trigger intercepted transition twice ([1fafa76](https://github.com/adfinis-sygroup/ember-simple-auth-oidc/commit/1fafa76))
* **dummy-app:** fix queryParams handling in dummy ([76ab8ef](https://github.com/adfinis-sygroup/ember-simple-auth-oidc/commit/76ab8ef))


### Features

* **redirect:** add support for login_hint ([9074063](https://github.com/adfinis-sygroup/ember-simple-auth-oidc/commit/9074063))

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
