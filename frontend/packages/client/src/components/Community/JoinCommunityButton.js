import { useEffect, useState } from 'react';
import { useModalContext } from 'contexts/NotificationModal';
import { useWebContext } from 'contexts/Web3';
import { Svg } from '@cast/shared-components';
import { Error, WalletConnect } from 'components';
import { useJoinCommunity, useUserRoleOnCommunity } from 'hooks';
import classnames from 'classnames';

export default function JoinCommunityButton({
  communityId,
  // callback to notify leaveCommunity was called
  onLeaveCommunity = async () => {},
  onJoinCommunity = async () => {},
  size = 'small',
}) {
  const [isModalErrorOpened, setIsModalErrorOpened] = useState(false);
  const { createCommunityUser, deleteUserFromCommunity } = useJoinCommunity();
  const { user } = useWebContext();
  const { openModal, closeModal } = useModalContext();
  const isMember = useUserRoleOnCommunity({
    addr: user?.addr,
    communityId,
    roles: ['member'],
  });

  useEffect(() => {
    if (user?.addr && isModalErrorOpened) {
      closeModal();
      setIsModalErrorOpened(false);
    }
  }, [user?.addr, isModalErrorOpened, closeModal, setIsModalErrorOpened]);

  const joinCommunity = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!user?.addr) {
      openModal(
        <Error
          error={
            <div className="mt-5">
              <WalletConnect
                closeModal={() => {
                  closeModal();
                }}
              />
            </div>
          }
          errorTitle="Please connect a wallet."
        />,
        { classNameModalContent: 'rounded-sm' }
      );
      setIsModalErrorOpened(true);
      return;
    }
    await createCommunityUser(
      {
        communityId,
        user,
      },
      {
        onSuccess: async () => {
          await onJoinCommunity();
        },
      }
    );
  };

  const leaveCommunity = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    await deleteUserFromCommunity(
      {
        communityId,
        user,
      },
      {
        onSuccess: async () => {
          await onLeaveCommunity();
        },
      }
    );
  };

  const buttonClasses = classnames(
    'button join-community-button p-0 is-fullwidth full-height',
    {
      'is-active': isMember,
      'rounded-lg': size === 'small',
      'rounded-xl small-text px-4': size === 'large',
    }
  );

  const containerStyles =
    size === 'small'
      ? { width: 40, height: 40 }
      : { height: 48, maxWidth: 125 };

  let joinCopy = 'Watch';
  if (isMember) joinCopy += 'ing';

  return (
    <div
      className="column p-0 is-narrow-tablet is-full-mobile"
      style={containerStyles}
    >
      <button
        className={buttonClasses}
        onClick={isMember ? leaveCommunity : joinCommunity}
      >
        <Svg name="Eye" />
        <Svg name="HideEye" />
        {!isMember && (
          <span className="join-community-cta py-2 px-4 rounded-lg has-text-white has-background-black smaller-text">
            Watch this community
          </span>
        )}
        {size === 'large' && <span className="ml-2">{joinCopy}</span>}
      </button>
    </div>
  );
}
