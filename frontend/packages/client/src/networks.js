const networksConfig = {
  emulator: {
    accessApi: process.env.REACT_APP_EMULATOR_API || 'http://localhost:8888',
    walletDiscovery:
      process.env.REACT_APP_EMULATOR_WALLET_DISCOVERY ||
      'http://localhost:8701/fcl/authn',
    walletDiscoveryApi: null,
    walletDiscoveryInclude: [],
    strategiesConfig: {},
  },
  testnet: {
    accessApi: 'https://rest-testnet.onflow.org',
    walletDiscovery: 'https://fcl-discovery.onflow.org/testnet/authn',
    walletDiscoveryApi: 'https://fcl-discovery.onflow.org/api/testnet/authn',
    walletDiscoveryInclude: [
      // '0x9d2e44203cb13051', // Ledger
      // '0x82ec283f88a62e65' // Dapper Wallet
    ],
    strategiesConfig: {},
  },
  mainnet: {
    accessApi: 'https://rest-mainnet.onflow.org',
    walletDiscovery: 'https://fcl-discovery.onflow.org/authn',
    walletDiscoveryApi: 'https://fcl-discovery.onflow.org/api/authn',
    walletDiscoveryInclude: [
      // '0xe5cd26afebe62781', // Ledger
      // '0xead892083b3e2c6c' // Dapper Wallet
    ],
    strategiesConfig: {},
  },
};

export default networksConfig;
