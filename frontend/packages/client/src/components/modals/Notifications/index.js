import { useNotificationServiceContext } from 'contexts/NotificationService';
import { subscribeNotificationIntentions } from 'const';
import NotificationsManage from './Manage';
import NotificationsSignUp from './SignUp';

const NotificationsModal = ({ onClose, communityId }) => {
  const {
    notificationSettings,
    updateCommunitySubscription,
    updateAllEmailNotificationSubscription,
  } = useNotificationServiceContext();

  const community =
    notificationSettings?.communitySubscription?.find(
      ({ communityId: id }) => id === communityId
    ) ?? {};

  const { subscribed: isSubscribed } = community;

  const handleSubscribeNotification = (signupAll) => {
    if (signupAll) {
      updateAllEmailNotificationSubscription(
        subscribeNotificationIntentions.subscribe
      );
    } else {
      updateCommunitySubscription(
        communityId,
        subscribeNotificationIntentions.subscribe
      );
    }
  };
  if (isSubscribed) {
    return <NotificationsManage onClose={onClose} />;
  }

  return (
    <NotificationsSignUp
      onSubscribe={handleSubscribeNotification}
      onClose={onClose}
      communityId={communityId}
    />
  );
};

export default NotificationsModal;
