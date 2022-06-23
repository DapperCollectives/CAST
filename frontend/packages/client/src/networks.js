const networksConfig = {
  emulator: {
    accessApi: process.env.REACT_APP_EMULATOR_API || 'http://localhost:8080',
    walletDiscovery:
      process.env.REACT_APP_EMULATOR_WALLET_DISCOVERY ||
      'http://localhost:8701/fcl/authn',
  },
  testnet: {
    accessApi: 'https://access-testnet.onflow.org',
    walletDiscovery: 'https://fcl-discovery.onflow.org/testnet/authn',
  },
  mainnet: {
    accessApi: 'https://mainnet.onflow.org',
    walletDiscovery: 'https://fcl-discovery.onflow.org/authn',
  },
};

export default networksConfig;
