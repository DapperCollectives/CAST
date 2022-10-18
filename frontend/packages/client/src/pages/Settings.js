import { useNotificationServiceContext } from 'contexts/NotificationService';
import { BackButton, HomeFooter } from 'components';
import {
  ConnectWalletPrompt,
  NotificationSettingsSection,
  SettingsSection,
} from 'components/Settings';
import { useMediaQuery } from 'hooks';
import SectionContainer from 'layout/SectionContainer';

export default function Settings() {
  const { notificationSettings } = useNotificationServiceContext();
  const { walletId } = notificationSettings;
  const notMobile = useMediaQuery();

  return (
    <SectionContainer>
      <div className="columns">
        <div className={'column is-one-third'}>
          <div style={{ width: '115px' }}>
            <BackButton isMobile={!notMobile} navTo={'/'} />
          </div>
        </div>
        {walletId && (
          <div className="column is-two-fifths">
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
