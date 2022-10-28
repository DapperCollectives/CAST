import { useNotificationServiceContext } from 'contexts/NotificationService';
import { subscribeNotificationIntentions } from 'const';
import NotificationsSignUp from './SignUp';

const NotificationsModal = ({ onClose, communityId }) => {
  const {
    updateCommunitySubscription,
    updateAllEmailNotificationSubscription,
  } = useNotificationServiceContext();

  const handleSubscribeNotification = (signupAll) => {
    updateCommunitySubscription(
      communityId,
      subscribeNotificationIntentions.subscribe
    );
    if (signupAll) {
      updateAllEmailNotificationSubscription(
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
