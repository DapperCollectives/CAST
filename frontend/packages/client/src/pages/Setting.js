import { useNotificationService } from 'hooks';

export default function Setting() {
  const { notificationSettings } = useNotificationService();
  const { walletId } = notificationSettings;
  if (walletId) {
    return <h1>Setting page</h1>;
  } else {
    return <h1>Please Connect to wallet first</h1>;
  }
}
