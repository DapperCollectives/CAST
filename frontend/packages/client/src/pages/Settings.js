import { Fragment } from 'react';
import {
  BackButton,
  ConnectWalletPrompt,
  NotificationSettingsSection,
  SettingsSection,
} from 'components/Settings';
import { useMediaQuery, useNotificationService } from 'hooks';

export default function Settings() {
  const { notificationSettings } = useNotificationService();
  const { walletId } = notificationSettings;
  const notMobile = useMediaQuery();

  return (
    <div className="columns">
      <BackButton notMobile={notMobile} />
      {walletId ? (
        <Fragment>
          <SettingsSection />
          <NotificationSettingsSection />
        </Fragment>
      ) : (
        <ConnectWalletPrompt />
      )}
    </div>
  );
}
