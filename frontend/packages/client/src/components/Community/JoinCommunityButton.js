import React, { useEffect, useState } from 'react';
import { useWebContext } from 'contexts/Web3';
import { useModalContext } from 'contexts/NotificationModal';
import { useJoinCommunity, useUserRoleOnCommunity } from 'hooks';
import { WalletConnect, Error } from 'components';

export default function JoinCommunityButton({
  communityId,
  setTotalMembers = () => {},
  // callback to notify leaveCommunity was called
  onLeaveCommunity = async () => {},
  onJoinCommunity = async () => {},
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

  const joinCommunity = async () => {
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

  const leaveCommunity = async () => {
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

  return (
    <div
      className="column is-narrow-tablet is-full-mobile is-align-self-center"
      style={{ minWidth: '117px' }}
    >
      <button
        className="button is-uppercase is-fullwidth"
        style={{
          backgroundColor: 'black',
          borderRadius: '200px',
          color: 'white',
        }}
        onClick={isMember ? leaveCommunity : joinCommunity}
      >
        {isMember ? 'Leave' : 'Join'}
      </button>
    </div>
  );
}
