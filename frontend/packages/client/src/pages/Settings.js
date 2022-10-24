import { useNotificationServiceContext } from 'contexts/NotificationService';
import { HomeFooter } from 'components';
import {
  ConnectWalletPrompt,
  NotificationSettingsSection,
  SettingsSection,
} from 'components/Settings';
import SectionContainer from 'layout/SectionContainer';

export default function Settings() {
  const { notificationSettings } = useNotificationServiceContext();
  const { walletId } = notificationSettings;

  return (
    <SectionContainer>
      <div>
        {walletId && (
          <div style={{ width: '50%', margin: 'auto' }}>
            <SettingsSection walletId={walletId} />
            <NotificationSettingsSection />
          </div>
        )}
        {!walletId && <ConnectWalletPrompt />}
      </div>
      <HomeFooter />
    </SectionContainer>
  );
}
