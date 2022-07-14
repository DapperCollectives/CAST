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
        React.createElement(Error, {
          error: (
            <div className="mt-5">
              <WalletConnect />
            </div>
          ),

          errorTitle: 'Please connect a wallet.',
        }),
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

  const classNamesButton = classnames('button is-uppercase is-fullwidth ', {
    'rounded-lg has-background-black has-text-white-bis': darkMode,
    'rounded-sm has-text-black border-lighter-dark-grey small-text': !darkMode,
  });

  return (
    <div
      className="column is-narrow-tablet is-full-mobile is-align-self-center"
      style={{ minWidth: '117px' }}
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
