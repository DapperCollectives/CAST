import React, { useEffect, useState, useCallback } from 'react';
import * as fcl from '@onflow/fcl';
import networks from 'networks';
import { useFclUser } from 'hooks';
import { WalletConnectModal } from 'components';

// create our app context
export const Web3Context = React.createContext({});

export const useWebContext = () => {
  const context = React.useContext(Web3Context);
  if (context === undefined) {
    throw new Error('`useWebContext` must be used within a `Web3Context`.');
  }
  return context;
};

// provider Component that wraps the entire app and provides context variables
export function Web3Provider({ children, network = 'testnet', ...props }) {
  const [openModal, setOpenModal] = useState(false);
  const [services, setServices] = useState([]);
  const [transactionInProgress, setTransactionInProgress] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [transactionError, setTransactionError] = useState('');
  const [txId, setTxId] = useState(null);
  const [extraConfig, setExtraConfig] = useState({ forceLedger: false });

  const executeTransaction = async (cadence, args, options = {}) => {
    setTransactionInProgress(true);
    setTransactionStatus(-1);

    const transactionId = await fcl
      .mutate({
        cadence,
        args,
        payer: fcl.authz,
        proposer: fcl.authz,
        authorizations: [fcl.authz],
        limit: options.limit || 50,
      })
      .catch((e) => {
        setTransactionInProgress(false);
        setTransactionStatus(500);
        setTransactionError(String(e));
      });

    if (transactionId) {
      setTxId(transactionId);
      fcl
        .tx(transactionId)
        .subscribe((res) => setTransactionStatus(res.status));
    }
  };

  const logOut = async () => {
    await fcl.unauthenticate();
  };

  useEffect(() => {
    const {
      accessApi,
      walletDiscovery,
      walletDiscoveryApi,
      walletDiscoveryInclude,
    } = networks[network];
    const iconUrl = window.location.origin + '/logo.png';

    fcl.config({
      'app.detail.title': 'CAST',
      'app.detail.icon': iconUrl,
      'accessNode.api': accessApi, // connect to Flow
      'discovery.wallet': walletDiscovery, // use wallets on public discovery
      'discovery.authn.endpoint': walletDiscoveryApi, // public discovery api endpoint
      'discovery.authn.include': walletDiscoveryInclude, // opt-in wallets
    });
  }, [network]);

  // filter services for now only blocto
  useEffect(() => {
    if (process.env.REACT_APP_FLOW_ENV !== 'emulator') {
      fcl.discovery.authn.subscribe((res) => {
        const filteredServices = res.results.filter((service) =>
          service.uid.includes('blocto')
        );
        setServices(filteredServices);
      });
    } else {
      // hard code service for local dev wallet
      // this setting will enable to show blocto to connect
      setServices([
        {
          f_type: 'Service',
          f_vsn: '1.0.0',
          type: 'authn',
          method: 'IFRAME/RPC',
          uid: 'blocto#authn',
          provider: {
            name: 'Blocto',
            icon: '/images/blocto.png',
          },
        },
      ]);
    }
  }, []);

  const setWebContextConfig = useCallback((config) => {
    setExtraConfig(config);
  }, []);

  const { user, isLedger } = useFclUser(fcl, extraConfig.forceLedger);

  // add check for address
  const isValidFlowAddress = async (addr) => {
    try {
      // https://docs.onflow.org/fcl/reference/api/#account
      return fcl.account(addr);
    } catch (err) {
      return false;
    }
  };
  // for Nextjs Builds, return null until "window" is available
  if (!global.window) {
    return null;
  }

  const openWalletModal = () => {
    setOpenModal(true);
  };
  const closeModal = () => {
    setOpenModal(false);
  };
  // use props as a way to pass configuration values
  const providerProps = {
    executeTransaction,
    setWebContextConfig,
    transaction: {
      id: txId,
      inProgress: transactionInProgress,
      status: transactionStatus,
      errorMessage: transactionError,
    },
    injectedProvider: fcl,
    user,
    address: user.addr,
    isLedger,
    network,
    logOut,
    openWalletModal,
    isValidFlowAddress,
    ...props,
  };

  return (
    <Web3Context.Provider value={providerProps}>
      <WalletConnectModal
        services={services}
        openModal={openModal}
        closeModal={closeModal}
        injectedProvider={fcl}
      />
      {children}
    </Web3Context.Provider>
  );
}

export function Web3Consumer(Component) {
  return function HOC(pageProps) {
    return (
      <Web3Context.Consumer>
        {(web3Values) => <Component web3={web3Values} {...pageProps} />}
      </Web3Context.Consumer>
    );
  };
}
