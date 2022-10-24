import { useNotificationServiceContext } from 'contexts/NotificationService';
import { subscribeNotificationIntentions } from 'const';
import NotificationsSignUp from './SignUp';

const NotificationsModal = ({ onClose, communityId }) => {
  const {
    updateCommunitySubscription,
    updateAllEmailNotificationSubscription,
  } = useNotificationServiceContext();

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

  return (
    <NotificationsSignUp
      onSubscribe={handleSubscribeNotification}
      onClose={onClose}
      communityId={communityId}
    />
  );
};

export default NotificationsModal;
