import { useNotificationServiceContext } from 'contexts/NotificationService';

export default function Settings() {
  const { notificationSettings } = useNotificationServiceContext();
  const { walletId } = notificationSettings;

  if (!walletId) {
    return <h1>Please Connect to wallet first</h1>;
  }
  return <h1>settings page</h1>;
}
