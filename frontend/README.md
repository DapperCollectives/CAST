# CAST Frontend

## Prerequisites

- [Yarn](https://classic.yarnpkg.com/lang/en/docs/install)
- [GoLang 1.6](https://golang.org/doc/install)
- [Node/NPM v16](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [Flow CLI](https://docs.onflow.org/flow-cli/install/)
  - Note: See below for how install v0.30.2 (required)

## Installation

```bash
yarn install
```

## Development

#### Contracts

To start a local blockchain using `flow emulator`:

```bash
yarn chain
```

To deploy all contracts in `./packages/cadence/contracts`:

```bash
yarn deploy
```

#### Client

```bash
yarn start
```

You should now be able to see the client app at `localhost:3000`.

## Testing

First, disable the storage limit for the Flow emulator

```bash
export FLOW_STORAGELIMITENABLED=false
```

Then, run the test suite

```bash
cd test
npm run test
```

## Troubleshooting

### Install Flow v0.30.2

Currently you need to run Flow v0.30.2 for local development. Follow the commands below to install the specific version of Flow needed.

```sh
> curl --progress-bar "https://storage.googleapis.com/flow-cli/flow-x86_64-darwin-v0.30.2" --output flow && mv flow /usr/local/bin

> chmod +x /usr/local/bin/flow
```
