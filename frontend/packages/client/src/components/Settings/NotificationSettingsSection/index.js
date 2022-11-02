import { useModalContext } from 'contexts/NotificationModal';
import { useNotificationServiceContext } from 'contexts/NotificationService';
import { ErrorModal } from 'components';
import CommunitiesList from './CommunitiesList';
import EmailAddressInput from './EmailAddressInput';
import ReceiveEmailNotificationsSwitch from './ReceiveEmailNotificationsSwitch';

export default function NotificationSettingsSection() {
  const {
    notificationSettings,
    setUserEmail,
    updateAllEmailNotificationSubscription,
    updateCommunitySubscription,
  } = useNotificationServiceContext();
  const { communitySubscription, email, isSubscribedFromCommunityUpdates } =
    notificationSettings;
  const { openModal, closeModal } = useModalContext();
  const handleError = (fn) => {
    return async (...args) => {
      try {
        await fn(...args);
      } catch {
        openModal(
          <ErrorModal
            message="Something went wrong, and your action could not be completed. Please try again later."
            title="Error"
            footerComponent={
              <button
                className="button subscribe-community-button p-0 is-fullwidth rounded-lg"
                onClick={closeModal}
              >
                Close
              </button>
            }
            onClose={closeModal}
          />,
          { isErrorModal: true }
        );
        throw new Error();
      }
    };
  };
  return (
    <section className={'column is-flex is-flex-direction-column mt-5'}>
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
        <>
          <EmailAddressInput
            defaultEmail={email}
            setUserEmail={handleError(setUserEmail)}
          />
          <hr />
          <ReceiveEmailNotificationsSwitch
            isSubscribedFromCommunityUpdates={isSubscribedFromCommunityUpdates}
            updateAllEmailNotificationSubscription={handleError(
              updateAllEmailNotificationSubscription
            )}
          />
          <hr />
          {isSubscribedFromCommunityUpdates && (
            <CommunitiesList
              communitySubscription={communitySubscription}
              updateCommunitySubscription={handleError(
                updateCommunitySubscription
              )}
            />
          )}
          <p className="has-text-grey has-text-centered py-5">
            Changes are autosaved ✨
          </p>
        </>
      )}
    </section>
  );
}
