import { Fragment } from 'react';
import { useNotificationServiceContext } from 'contexts/NotificationService';
import { useMediaQuery } from 'hooks';
import CommunitiesList from './CommunitiesList';
import EmailAddressInput from './EmailAddressInput';
import ReceiveEmailNotificationsSwitch from './ReceiveEmailNotificationsSwitch';

export default function NotificationSettingsSection() {
  const notMobile = useMediaQuery();
  const {
    notificationSettings,
    setUserEmail,
    updateAllEmailNotificationSubscription,
    updateCommunitySubscription,
  } = useNotificationServiceContext();
  const { communitySubscription, email, isSubscribedFromCommunityUpdates } =
    notificationSettings;
  return (
    <section
      className={`column is-flex is-flex-direction-column ${
        notMobile ? 'mt-7 px-6' : 'px-5'
      }`}
    >
      <h2 className="is-size-4 has-text-weight-bold">Notification Settings</h2>
      {communitySubscription.length === 0 && (
        <div className="has-text-grey pt-3">
          <p>You currently don’t have notifications on. </p>
          <br></br>
          <p>
            To turn on notifications, opt in from an individual community page.
          </p>
        </div>
      )}
      {communitySubscription.length > 0 && (
        <Fragment>
          <EmailAddressInput email={email} setUserEmail={setUserEmail} />
          <hr />
          <ReceiveEmailNotificationsSwitch
            isSubscribedFromCommunityUpdates={isSubscribedFromCommunityUpdates}
            updateAllEmailNotificationSubscription={
              updateAllEmailNotificationSubscription
            }
          />
          <hr />
          {isSubscribedFromCommunityUpdates && (
            <CommunitiesList
              communitySubscription={communitySubscription}
              updateCommunitySubscription={updateCommunitySubscription}
            />
          )}

          <hr />
          <p className="has-text-grey has-text-centered">
            Changes are autosaved ✨
          </p>
        </Fragment>
      )}
    </section>
  );
}
