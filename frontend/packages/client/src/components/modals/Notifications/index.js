import { useNotificationServiceContext } from 'contexts/NotificationService';
import { useWebContext } from 'contexts/Web3';
import { useUserCommunities } from 'hooks';
import { subscribeNotificationIntentions } from 'const';
import NotificationsSignUp from './SignUp';

const NotificationsModal = ({ onClose, communityId }) => {
  const { updateCommunitySubscription } = useNotificationServiceContext();
  const {
    user: { addr },
  } = useWebContext();
  const { data: userCommunities } = useUserCommunities({
    addr,
    count: 100,
    initialLoading: false,
  });
  const handleSubscribeNotification = (signupAll) => {
    const intentions = [];
    if (signupAll) {
      userCommunities.forEach(({ id }) => {
        intentions.push({
          communityId: id.toString(),
          subscribeIntention: subscribeNotificationIntentions.subscribe,
        });
      });
    } else {
      intentions.push({
        communityId,
        subscribeIntention: subscribeNotificationIntentions.subscribe,
      });
    }
    updateCommunitySubscription(intentions);
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
