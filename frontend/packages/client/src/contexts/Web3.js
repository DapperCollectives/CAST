import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { WalletConnectModal } from 'components';
import { useFclUser } from 'hooks';
import { IS_LOCAL_DEV } from 'const';
import { getCompositeSigs } from 'utils';
import * as fcl from '@onflow/fcl';
import * as t from '@onflow/types';
import networks from 'networks';

// create our app context
export const Web3Context = createContext({});

export const useWebContext = () => {
  const context = useContext(Web3Context);
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

    // discovery.wallet.method config will be delayed
    // untill user selects wallet to conect
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
    if (!IS_LOCAL_DEV) {
      fcl.discovery.authn.subscribe((res) => {
        setServices(res.results);
      });
    } else {
      // hard code service for local dev wallet
      // this setting will enable to show blocto to connect
      setServices([
        {
          f_type: 'Service',
          f_vsn: '1.0.0',
          method: 'EXT/RPC',
          provider: {
            icon: 'https://raw.githubusercontent.com/Outblock/Lilico-Web/main/asset/logo-dis.png',
            name: 'Lilico',
          },
          type: 'authn',
          uid: 'Lilico',
        },
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
        {
          f_type: 'Service',
          f_vsn: '1.0.0',
          type: 'authn',
          method: 'POP/RPC',
          uid: 'dapper-wallet#authn',
          provider: {
            name: 'Dapper Wallet',
            icon: '/images/dapper.svg',
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

  /**
   *
   * @param {String} cadence - transaction code to be authorized by user
   * @param {String} data - transaction argument, or message data
   *  we want to validate on the backend
   * @returns {Object} - voucher as JSON
   */
  const signMessageVoucher = async (cadence, data) => {
    const voucher = await fcl.serialize([
      fcl.transaction(cadence),
      fcl.args([fcl.arg(data, t.String)]),
      fcl.limit(999),
      fcl.proposer(fcl.authz),
      fcl.authorizations([fcl.authz]),
      fcl.payer(fcl.authz),
    ]);
    return JSON.parse(voucher);
  };

  /**
   *
   * @param {String} walletProvider ID of the wallet service user is connected to
   * @param {String} cadence transaction code to be authorized
   * @param {String} data transaction argument, or message data to be validated on the backend
   * @returns {[Array?, Object?]} first element is an array of composite signatures,
   * second element is voucher JSON parsed into an Object.  If function is successful, one element will be null.  If it fails, both elements will be null.
   */
  const signMessageByWalletProvider = async (walletProvider, cadence, data) => {
    const hexData = Buffer.from(data).toString('hex');
    try {
      let voucher;
      switch (walletProvider) {
        case 'dapper#authn':
          voucher = await signMessageVoucher(cadence, hexData);
          return [null, voucher];
        case 'fcl-ledger-authz':
          voucher = await signMessageVoucher(cadence, hexData);
          return [null, voucher];
        default:
          const _compositeSignatures = await fcl
            .currentUser()
            .signUserMessage(hexData);
          return [getCompositeSigs(_compositeSignatures), null];
      }
    } catch (e) {
      return [null, null];
    }
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
    signMessageByWalletProvider,
    signMessageVoucher,
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
