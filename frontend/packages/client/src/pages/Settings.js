import { useWebContext } from 'contexts/Web3';
import { HomeFooter } from 'components';
import {
  ConnectWalletPrompt,
  NotificationSettingsSection,
  SettingsSection,
} from 'components/Settings';
import SectionContainer from 'layout/SectionContainer';

export default function Settings() {
  const {
    user: { addr },
  } = useWebContext();

  return (
    <SectionContainer>
      <div>
        {addr && (
          <div style={{ width: '50%', margin: 'auto' }}>
            <SettingsSection walletId={addr} />
            <NotificationSettingsSection />
          </div>
        )}
        {!addr && <ConnectWalletPrompt />}
      </div>
      <HomeFooter />
    </SectionContainer>
  );
}
