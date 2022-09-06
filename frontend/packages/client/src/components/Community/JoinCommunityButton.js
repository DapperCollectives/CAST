import React, { useEffect, useState } from 'react';
import { useModalContext } from 'contexts/NotificationModal';
import { useWebContext } from 'contexts/Web3';
import { Error, WalletConnect } from 'components';
import { useJoinCommunity, useUserRoleOnCommunity } from 'hooks';
import classnames from 'classnames';

export default function JoinCommunityButton({
  communityId,
  // callback to notify leaveCommunity was called
  onLeaveCommunity = async () => {},
  onJoinCommunity = async () => {},
  darkMode = true,
  classNames,
  buttonClassNames = '',
  extraStyles,
  borderRadious = 'rounded-lg',
  containerAlignment = 'is-align-self-center',
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

  const classNamesContainer = `column is-narrow-tablet is-full-mobile ${classNames} ${containerAlignment}`;

  const classNamesButton = classnames(
    `button is-uppercase is-fullwidth ${buttonClassNames} ${borderRadious}`,
    {
      'has-background-black has-text-white-bis': darkMode,
      'rounded-sm has-text-black border-lighter-dark-grey small-text':
        !darkMode,
    }
  );

  return (
    <div
      className={classNamesContainer}
      style={{ minWidth: '117px', ...extraStyles }}
    >
      <button
        className={classNamesButton}
        onClick={isMember ? leaveCommunity : joinCommunity}
      >
        {isMember ? 'Leave' : 'Join'}
      </button>
    </div>
  );
}
