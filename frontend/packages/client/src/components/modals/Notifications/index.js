import { useNotificationServiceContext } from 'contexts/NotificationService';
import { useWebContext } from 'contexts/Web3';
import { useUserCommunities } from 'hooks';
import { subscribeNotificationIntentions } from 'const';
import NotificationsSignUp from './SignUp';

const NotificationsModal = ({ onClose, onError, onSuccess, communityId }) => {
  const { updateCommunitySubscription, setUserEmail } =
    useNotificationServiceContext();

  const {
    user: { addr },
  } = useWebContext();
  const { data: userCommunities } = useUserCommunities({
    addr,
    count: 100,
    initialLoading: false,
  });
  const handleSubscribeNotification = async (email, signupAll) => {
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
    try {
      await setUserEmail(email);
      await updateCommunitySubscription(intentions);
      onSuccess(subscribeNotificationIntentions.subscribe);
    } catch {
      onError();
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
