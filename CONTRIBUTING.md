# How To Contribute

## Installation

- `git clone <repository-url>`
- `cd ember-simple-auth-oidc`
- `pnpm install`

## Linting

Automatic linting via `husky` _pre-commit_ is setup. For manual linting use:

- `pnpm lint`
- `pnpm lint:fix`

## Formatting

Please stick to [conventional commit](https://www.conventionalcommits.org/en/v1.0.0/) messages to make our semantic release versioning work.

## Running tests

- `pnpm test` – Runs the test suite on the current Ember version
- `pnpm test:ember --server` – Runs the test suite in "watch mode"
- `pnpm test:ember-compatibility` – Runs the test suite against multiple Ember versions

## Running the dummy application

- `pnpm start`
- Visit the dummy application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://cli.emberjs.com/release/](https://cli.emberjs.com/release/).
