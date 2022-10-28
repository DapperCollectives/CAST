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
  const subscribedToCommunity =
    notificationSettings?.communitySubscription.some(
      (c) => c.communityId === communityId && c.subscribed
    );
  const subscribedToEmails =
    notificationSettings?.isSubscribedFromCommunityUpdates;
  const isSubscribed = subscribedToCommunity && subscribedToEmails;
  const { popToast } = useToast();
  const { user } = useWebContext();
  const history = useHistory();

  const onOpenModal = () => {
    if (!user?.addr) {
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
    } else if (isSubscribed) {
      updateCommunitySubscription(
        communityId,
        subscribeNotificationIntentions.unsubscribe
      );
      const emailNotificationsState = subscribedToEmails ? 'on' : 'off';
      popToast({
        message: `Email notifications are turned ${emailNotificationsState}`,
        messageType: 'success',
        actionFn: () => history.push('/settings'),
        actionText: 'Manage Settings',
      });
    } else {
      openModal(
        <NotificationsModal communityId={communityId} onClose={closeModal} />,
        {
          classNameModalContent: 'rounded modal-content-sm',
          showCloseButton: false,
        }
      );
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
      <button className={buttonClasses} onClick={onOpenModal}>
        <Svg name={buttonIcon} style={{ minWidth: 24 }} />
        {size === 'full' && <span className="ml-2">{subscribeText}</span>}
      </button>
    </div>
  );
}
