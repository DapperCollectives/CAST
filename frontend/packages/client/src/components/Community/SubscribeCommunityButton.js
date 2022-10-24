import { useModalContext } from 'contexts/NotificationModal';
import { useNotificationServiceContext } from 'contexts/NotificationService';
import { useWebContext } from 'contexts/Web3';
import { Svg } from '@cast/shared-components';
import { ErrorModal, NotificationsModal, WalletConnect } from 'components';
import useToast from 'hooks/useToast';
import classnames from 'classnames';

export default function SubscribeCommunityButton({
  communityId,
  className,
  size = 'small',
}) {
  const { openModal, closeModal } = useModalContext();
  const { notificationSettings } = useNotificationServiceContext();
  const subscribedToCommunity =
    notificationSettings?.communitySubscription.some(
      (c) => c.communityId === communityId
    );
  const subscribedToEmails =
    notificationSettings?.isSubscribedFromCommunityUpdates;
  const isSubscribed = subscribedToCommunity && subscribedToEmails;
  const { popToast } = useToast();
  const { user } = useWebContext();

  const onOpenModal = () => {
    if (!user?.addr) {
      openModal(
        <ErrorModal
          message="In order to subscribe to a community, you must first connect your Flow wallet."
          title="Connect Wallet"
          footerComponent={
            <WalletConnect
              closeModal={() => {
                closeModal();
              }}
              expandToContainer
            />
          }
          onClose={closeModal}
        />,
        { isErrorModal: true }
      );
    } else if (isSubscribed) {
      popToast('Email notifications are turned on', {
        footerLink: '/settings',
        footerText: 'Manage Settings',
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

  const buttonIcon = isSubscribed ? 'BellFilled' : 'BellHidden';
  const buttonClasses = classnames(
    'button subscribe-community-button p-0 is-fullwidth full-height rounded-full',
    {
      'px-4': size === 'large',
    }
  );

  const sizes = {
    smaller: { height: 32, maxWidth: 32 },
    small: { width: 40, height: 40 },
  };

  const containerStyles = sizes[size] ?? { height: 48, maxWidth: 48 };

  return (
    <div
      className={`column p-0 is-narrow-tablet is-full-mobile ${className}`}
      style={containerStyles}
    >
      <button className={buttonClasses} onClick={onOpenModal}>
        <Svg name={buttonIcon} style={{ minWidth: 24 }} />
      </button>
    </div>
  );
}
