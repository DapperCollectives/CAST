# flow-voting-tool-ui

## Prerequisites

- [Yarn](https://classic.yarnpkg.com/lang/en/docs/install)
- [GoLang 1.6](https://golang.org/doc/install)
- [Node/NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [Flow CLI](https://docs.onflow.org/flow-cli/install/)

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
