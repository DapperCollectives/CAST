const networksConfig = {
  emulator: {
    accessApi: process.env.REACT_APP_EMULATOR_API || 'http://localhost:8080',
    walletDiscovery:
      process.env.REACT_APP_EMULATOR_WALLET_DISCOVERY ||
      'http://localhost:8701/fcl/authn',
    strategiesConfig: {
      'one-address-one-vote': {
        name: 'FlowToken',
        addr: '0x0ae53cb6e3f42a79',
        publicPath: 'flowTokenBalance',
      },
    },
  },
  testnet: {
    accessApi: 'https://access-testnet.onflow.org',
    walletDiscovery: 'https://fcl-discovery.onflow.org/testnet/authn',
    strategiesConfig: {
      'one-address-one-vote': {
        name: 'FlowToken',
        addr: '0x7e60df042a9c0868',
        publicPath: 'flowTokenBalance',
      },
    },
  },
  mainnet: {
    accessApi: 'https://mainnet.onflow.org',
    walletDiscovery: 'https://fcl-discovery.onflow.org/authn',
    strategiesConfig: {
      'one-address-one-vote': {
        name: 'FlowToken',
        addr: '0x1654653399040a61',
        publicPath: 'flowTokenBalance',
      },
    },
  },
};

export default networksConfig;
