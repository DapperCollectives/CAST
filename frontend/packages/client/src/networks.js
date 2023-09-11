const networksConfig = {
  emulator: {
    accessApi: process.env.REACT_APP_EMULATOR_API || 'http://localhost:8888',
    walletDiscovery:
      process.env.REACT_APP_EMULATOR_WALLET_DISCOVERY ||
      'http://localhost:8701/fcl/authn',
    walletDiscoveryApi: null,
    walletDiscoveryInclude: [],
    strategiesConfig: {},
    flowAddress: {
      contractName: 'FlowToken',
      contractAddr: '0x0ae53cb6e3f42a79',
      storagePath: 'flowTokenBalance',
      contractType: 'ft',
    },
  },
  testnet: {
    accessApi: 'https://rest-testnet.onflow.org',
    walletDiscovery: 'https://fcl-discovery.onflow.org/testnet/authn',
    walletDiscoveryApi: 'https://fcl-discovery.onflow.org/api/testnet/authn',
    walletDiscoveryInclude: [
      // '0x9d2e44203cb13051', // Ledger
      '0x82ec283f88a62e65', // Dapper Wallet
    ],
    strategiesConfig: {
      'one-address-one-vote': {
        name: 'FlowToken',
        addr: '0x7e60df042a9c0868',
        publicPath: 'flowTokenBalance',
      },
    },
    flowAddress: {
      contractName: 'FlowToken',
      contractAddr: '0x7e60df042a9c0868',
      storagePath: 'flowTokenBalance',
      contractType: 'ft',
    },
  },
  mainnet: {
    accessApi: 'https://rest-mainnet.onflow.org',
    walletDiscovery: 'https://fcl-discovery.onflow.org/authn',
    walletDiscoveryApi: 'https://fcl-discovery.onflow.org/api/authn',
    walletDiscoveryInclude: [
      // '0xe5cd26afebe62781', // Ledger
      '0xead892083b3e2c6c', // Dapper Wallet
    ],
    strategiesConfig: {
      'one-address-one-vote': {
        name: 'FlowToken',
        addr: '0x1654653399040a61',
        publicPath: 'flowTokenBalance',
      },
    },
    flowAddress: {
      contractName: 'FlowToken',
      contractAddr: '0x1654653399040a61',
      storagePath: 'flowTokenBalance',
      contractType: 'ft',
    },
  },
};

export default networksConfig;
