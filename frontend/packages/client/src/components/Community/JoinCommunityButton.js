import React, { useEffect, useState } from 'react';
import { useWebContext } from 'contexts/Web3';
import { useModalContext } from 'contexts/NotificationModal';
import { useJoinCommunity, useUserRoleOnCommunity } from 'hooks';
import { WalletConnect, Error } from 'components';
import classnames from 'classnames';

export default function JoinCommunityButton({
  communityId,
  setTotalMembers = () => {},
  // callback to notify leaveCommunity was called
  onLeaveCommunity = async () => {},
  onJoinCommunity = async () => {},
  darkMode = true,
  classNames,
  buttonClassNames,
  extraStyles,
  borderRadious = 'rounded-lg',
  containerAlignment = 'is-align-self-center',
}) {
  const [isModalErrorOpened, setIsModalErrorOpened] = useState(false);
  const { createCommunityUser, deleteUserFromCommunity } = useJoinCommunity();
  const { injectedProvider, user } = useWebContext();
  const { openModal, closeModal } = useModalContext();
  const isMember = useUserRoleOnCommunity({
    addr: user?.addr,
    communityId,
    roles: ['member'],
  });

  const refresh = (updateFn) => {
    setTotalMembers(updateFn);
  };

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
    const { success } = await createCommunityUser({
      communityId,
      user,
      injectedProvider,
    });
    if (success) {
      refresh((totalMembers) => ++totalMembers);
      await onJoinCommunity();
    }
  };

  const leaveCommunity = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const { success } = await deleteUserFromCommunity({
      communityId,
      user,
      injectedProvider,
    });

    if (success) {
      refresh((totalMembers) => --totalMembers);
      await onLeaveCommunity();
    }
  };

  const classNamesContainer = classnames(
    'column is-narrow-tablet is-full-mobile',
    {
      [classNames]: !!classNames,
      [containerAlignment]: !!containerAlignment,
    }
  );

  const classNamesButton = classnames('button is-uppercase is-fullwidth', {
    'has-background-black has-text-white-bis': darkMode,
    'rounded-sm has-text-black border-lighter-dark-grey small-text': !darkMode,
    [buttonClassNames]: !!buttonClassNames,
    [borderRadious]: !!borderRadious,
  });

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
