import Blockies from 'react-blockies';
import { Svg } from '@cast/shared-components';
import { useMediaQuery, useNotificationService } from 'hooks';

export default function SettingsSection() {
  const notMobile = useMediaQuery();
  const { notificationSettings } = useNotificationService();
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
          <p className="control has-icons-left has-icons-right">
            <input
              className="rounded-lg border-light flex-1 pl-6 has-text-grey"
              style={{ height: 41, width: 246 }}
              value={walletId}
            />
            <span className="is-left icon pt-2 pl-2">
              <Blockies
                seed={walletId}
                size={notMobile ? 6.5 : 5}
                scale={4}
                className="blockies"
              />
            </span>
            <span className="is-right icon pt-2">
              <Svg name="Copy"></Svg>
            </span>
          </p>
        </div>

        <button
          className={`button rounded-lg has-background-black has-text-white`}
        >
          Disconnect
        </button>
      </div>
    </section>
  );
}
