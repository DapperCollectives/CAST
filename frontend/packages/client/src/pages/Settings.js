import { Fragment } from 'react';
import { useNotificationServiceContext } from 'contexts/NotificationService';
import { HomeFooter } from 'components';
import {
  BackButton,
  ConnectWalletPrompt,
  NotificationSettingsSection,
  SettingsSection,
} from 'components/Settings';
import { useMediaQuery } from 'hooks';

export default function Settings() {
  const { notificationSettings } = useNotificationServiceContext();
  const { walletId } = notificationSettings;
  const notMobile = useMediaQuery();

  return (
    <Fragment>
      <div className="columns">
        <div
          className={`column is-one-third ${
            notMobile ? 'p-6' : 'px-5 pt-5 pb-3'
          }`}
        >
          <BackButton notMobile={notMobile} />
        </div>
        {walletId ? (
          <div className="column is-two-fifths">
            <SettingsSection />
            <NotificationSettingsSection />
          </div>
        ) : (
          <ConnectWalletPrompt />
        )}
      </div>
      <HomeFooter />
    </Fragment>
  );
}
