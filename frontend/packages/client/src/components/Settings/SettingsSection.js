import Blockies from 'react-blockies';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useNotificationServiceContext } from 'contexts/NotificationService';
import { useWebContext } from 'contexts/Web3';
import { Svg } from '@cast/shared-components';
import { useMediaQuery } from 'hooks';

export default function SettingsSection() {
  const notMobile = useMediaQuery();
  const { notificationSettings } = useNotificationServiceContext();
  const { injectedProvider } = useWebContext();
  const { walletId } = notificationSettings;

  return (
    <section
      className={`column is-flex is-flex-direction-column ${
        notMobile ? 'mt-5 px-6' : 'px-5'
      }`}
    >
      <h2 className="is-size-4 has-text-weight-bold">Settings</h2>
      <h3 className="is-size-6 mt-2">Connected Wallet</h3>
      <div className="is-flex is-flex-direction-row is-flex-wrap-wrap is-align-items-center">
        <div className="mr-3 my-3">
          <p
            className="rounded-lg border-light flex-1 has-text-grey is-flex is-align-items-center pl-2"
            style={{ height: 41, width: 246 }}
          >
            <span>
              <Blockies
                seed={walletId}
                size={notMobile ? 6.5 : 5}
                scale={4}
                className="blockies"
              />
            </span>
            <span className="ml-1">{walletId}</span>

            <CopyToClipboard
              text={walletId}
              onCopy={() => {
                console.log('coiped');
              }}
            >
              <span className="cursor-pointer mt-2 ml-1">
                <Svg name="Copy"></Svg>
              </span>
            </CopyToClipboard>
          </p>
        </div>

        <button
          className={`button rounded-lg has-background-black has-text-white`}
          onClick={() => {
            injectedProvider.unauthenticate();
          }}
        >
          Disconnect
        </button>
      </div>
    </section>
  );
}
