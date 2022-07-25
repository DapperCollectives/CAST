# CAST Frontend

## Prerequisites

- [Yarn](https://classic.yarnpkg.com/lang/en/docs/install)

- [GoLang 1.16+](https://golang.org/doc/install)
- [Node/NPM v16](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [Flow CLI v0.37.5](https://docs.onflow.org/flow-cli/install/)

## Installation

```bash
yarn install
```

Installing Node via [NVM](https://github.com/nvm-sh/nvm#installation-and-update)
```bash
nvm install v16.13.0
nvm use 16
node -v
```

## Development

#### Client

```bash
yarn start
```

You should now be able to see the client app at `localhost:3000`.

#### Blockchain

To start a local blockchain & dev-wallet, follow the instructions in the `/backend` folder.

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