import { useNotificationServiceContext } from 'contexts/NotificationService';

export default function ReceiveEmailNotificationsSwitch() {
  const {
    notificationSettings,
    unsubscribeFromEmailNotifications,
    resubscribeFromEmailNotifications,
  } = useNotificationServiceContext();

  const { isSubscribedFromCommunityUpdates } = notificationSettings;

  const handleSubscribeAllNotifications = () => {
    if (isSubscribedFromCommunityUpdates) {
      unsubscribeFromEmailNotifications();
    } else {
      resubscribeFromEmailNotifications();
    }
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
        ></input>
        <label htmlFor="subscribeAllNotification"></label>
      </div>
    </div>
  );
}
