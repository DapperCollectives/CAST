import { useNotificationServiceContext } from 'contexts/NotificationService';
import NotificationsManage from './NotificationsManage';
import NotificationsSignUp from './NotificationsSignUp';

const NotificationsModal = ({ onClose, communityId }) => {
  const { notificationSettings, subscribeCommunity } =
    useNotificationServiceContext();

  const isSubscribed = notificationSettings?.communitySubscription.some(
    (c) => c === communityId
  );
  if (isSubscribed) {
    return <NotificationsManage onClose={onClose} />;
  }

  return (
    <NotificationsSignUp
      onSubscribe={subscribeCommunity}
      onClose={onClose}
      communityId={communityId}
    />
  );
};

export default NotificationsModal;
