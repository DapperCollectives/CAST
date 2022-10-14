import { useWebContext } from 'contexts/Web3';

export default function SettingsConnectWalletPrompt() {
  const { openWalletModal } = useWebContext();
  return (
    <div
      className="column is-two-fifths mt-6 is-flex is-flex-direction-column is-justify-content-center is-align-items-center"
      style={{ height: '65vh' }}
    >
      <h1 className="is-size-4 has-text-centered has-text-weight-bold">
        To view your settings, you must first connect your wallet.
      </h1>
      <button
        className="button mt-3 rounded-lg has-text-black has-text-weight-bold has-background-yellow"
        style={{ width: 160, height: 40 }}
        onClick={openWalletModal}
      >
        Connet Wallet
      </button>
    </div>
  );
}
