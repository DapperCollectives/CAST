import { useModalContext } from 'contexts/NotificationModal';
import { useNotificationServiceContext } from 'contexts/NotificationService';
import { useWebContext } from 'contexts/Web3';
import { Svg } from '@cast/shared-components';
import { ErrorModal, NotificationsModal, WalletConnect } from 'components';
import classnames from 'classnames';

export default function SubscribeCommunityButton({
  communityId,
  className,
  size = 'small',
}) {
  const { openModal, closeModal } = useModalContext();
  const { notificationSettings } = useNotificationServiceContext();
  const isSubscribed = notificationSettings?.communitySubscription.some(
    (c) => c === communityId
  );

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

  const containerStyles = sizes[size] ?? { height: 48, maxWidth: 125 };

  return (
    <div
      className={`column p-0 is-narrow-tablet is-full-mobile ${className}`}
      style={containerStyles}
    >
      <button className={buttonClasses} onClick={onOpenModal}>
        <Svg name={buttonIcon} />
      </button>
    </div>
  );
}
