import { useMediaQuery } from 'hooks';
import CommunitiesList from './CommunitiesList';
import EmailAddressInput from './EmailAddressInput';
import ReceiveEmailNotificationsSwitch from './ReceiveEmailNotificationsSwitch';

export default function NotificationSettingsSection() {
  const notMobile = useMediaQuery();

  return (
    <section
      className={`column is-flex is-flex-direction-column ${
        notMobile ? 'mt-7 px-6' : 'px-5'
      }`}
    >
      <h2 className="is-size-4 has-text-weight-bold">Notification Settings</h2>
      <EmailAddressInput />
      <hr />
      <ReceiveEmailNotificationsSwitch />
      <hr />
      <CommunitiesList />
    </section>
  );
}
