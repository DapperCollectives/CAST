import { useNotificationServiceContext } from 'contexts/NotificationService';
import NotificationsManage from './Manage';
import NotificationsSignUp from './SignUp';

const NotificationsModal = ({ onClose, communityId }) => {
  const { notificationSettings, subscribeCommunity, setUserEmail } =
    useNotificationServiceContext();

  const isSubscribed = notificationSettings?.communitySubscription.some(
    (c) => c === communityId
  );
  if (isSubscribed) {
    return <NotificationsManage onClose={onClose} />;
  }

  return (
    <NotificationsSignUp
      setUserEmail={setUserEmail}
      onSubscribe={subscribeCommunity}
      onClose={onClose}
      communityId={communityId}
    />
  );
};

export default NotificationsModal;
