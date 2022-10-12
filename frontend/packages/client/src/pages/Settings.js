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
  );
}
