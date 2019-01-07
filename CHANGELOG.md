# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/)
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Changed

- Remove `realm` part as this is keycloak and not OIDC specific. In the case
  of a keycloak implementation, the `realm` should be part of the `host`.
  This change is not backwards compatible! Just remove the `realm` property
  from your configuration and add it directly to the `host` property.
