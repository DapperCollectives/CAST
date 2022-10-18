import { useNotificationServiceContext } from 'contexts/NotificationService';
import { subscribeNotificationIntentions } from 'const';

export default function ReceiveEmailNotificationsSwitch() {
  const { notificationSettings, updateAllEmailNotificationSubscription } =
    useNotificationServiceContext();

  const { isSubscribedFromCommunityUpdates } = notificationSettings;

  const handleSubscribeAllNotifications = () => {
    const subscribeIntention = isSubscribedFromCommunityUpdates
      ? subscribeNotificationIntentions.unsubscribe
      : subscribeNotificationIntentions.resubscribe;
    updateAllEmailNotificationSubscription(subscribeIntention);
  };

  return (
    <div className="is-flex is-flex-direction-rowis-align-items-start">
      <div className="flex-2">
        <h3 className="is-size-6 has-text-weight-medium">
          Receive Email Notifications
        </h3>
        <p className="has-text-grey">
          Emails are sent when a community adds a new proposal.
        </p>
      </div>
      <div className="flex-1 has-text-right">
        <input
          id="subscribeAllNotification"
          type="checkbox"
          className="switch is-rounded is-medium"
          checked={isSubscribedFromCommunityUpdates}
          onChange={handleSubscribeAllNotifications}
        />
        <label htmlFor="subscribeAllNotification"></label>
      </div>
    </div>
  );
}
