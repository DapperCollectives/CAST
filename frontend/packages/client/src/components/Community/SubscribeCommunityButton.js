import { useHistory } from 'react-router-dom';
import { useModalContext } from 'contexts/NotificationModal';
import { useNotificationServiceContext } from 'contexts/NotificationService';
import { useWebContext } from 'contexts/Web3';
import { Svg } from '@cast/shared-components';
import { ErrorModal, NotificationsModal, WalletConnect } from 'components';
import { useToast } from 'hooks';
import { subscribeNotificationIntentions } from 'const';
import classnames from 'classnames';

export default function SubscribeCommunityButton({
  communityId,
  className,
  size = 'small',
  emptyIcon = 'BellHidden',
}) {
  const { openModal, closeModal } = useModalContext();
  const { notificationSettings, updateCommunitySubscription } =
    useNotificationServiceContext();
  const { communitySubscription, isSubscribedFromCommunityUpdates, email } =
    notificationSettings;

  const subscribedToCommunity = communitySubscription.some(
    (c) => c.communityId === communityId?.toString() && c.subscribed
  );
  const subscribedToEmails = isSubscribedFromCommunityUpdates;
  const isSubscribed = subscribedToCommunity && subscribedToEmails;

  const { popToast } = useToast();
  const { user } = useWebContext();
  const history = useHistory();
  const openUpdateSubscriptionErorrModal = () => {
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
  };
  const openWalletErrorModal = () => {
    openModal(
      <ErrorModal
        message="In order to subscribe to a community, you must first connect your Flow wallet."
        title="Connect Wallet"
        footerComponent={
          <WalletConnect closeModal={closeModal} expandToContainer />
        }
        onClose={closeModal}
      />,
      { isErrorModal: true }
    );
  };
  const handleUpdateSubscription = async () => {
    const subscribeIntention = isSubscribed
      ? subscribeNotificationIntentions.unsubscribe
      : subscribeNotificationIntentions.subscribe;
    try {
      await updateCommunitySubscription([
        {
          communityId,
          subscribeIntention,
        },
      ]);
      const emailNotificationsState =
        subscribeIntention === subscribeNotificationIntentions.subscribe
          ? 'on'
          : 'off';
      popToast({
        message: `Email notifications are turned ${emailNotificationsState}`,
        messageType: 'success',
        actionFn: () => history.push('/settings'),
        actionText: 'Manage Settings',
      });
    } catch {
      openUpdateSubscriptionErorrModal();
    }
  };
  const handleSignUp = () => {
    openModal(
      <NotificationsModal communityId={communityId} onClose={closeModal} />,
      {
        classNameModalContent: 'rounded modal-content-sm',
        showCloseButton: false,
      }
    );
  };
  const handleBellButtonClick = () => {
    //if user is not connect to wallet open error modal
    if (!user?.addr) {
      openWalletErrorModal();
      return;
    }
    //if leanplum has user email handle the subscribe/unsubscribe and show toast
    //if leanplumn doesn't have user email, show subscribe modal
    if (email?.length > 0) {
      handleUpdateSubscription();
    } else {
      handleSignUp();
    }
  };

  const subscribeText = isSubscribed ? 'Subscribed' : 'Subscribe for Updates';
  const buttonIcon = isSubscribed ? 'BellFilled' : emptyIcon;
  const buttonClasses = classnames(
    'button subscribe-community-button p-0 is-fullwidth full-height',
    {
      'rounded-full': size !== 'full',
      'rounded-lg': size === 'full',
      'px-4': size === 'large' || size === 'full',
    }
  );

  const sizes = {
    smaller: { height: 32, maxWidth: 32 },
    small: { width: 40, height: 40 },
    large: { width: 48, height: 48 },
  };

  const containerStyles = sizes[size] ?? { height: 40, width: 'auto' };

  return (
    <div
      className={`column p-0 is-narrow-tablet is-full-mobile ${className}`}
      style={containerStyles}
    >
      <button className={buttonClasses} onClick={handleBellButtonClick}>
        <Svg name={buttonIcon} style={{ minWidth: 24 }} />
        {size === 'full' && <span className="ml-2">{subscribeText}</span>}
      </button>
    </div>
  );
}
