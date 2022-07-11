import React, { useEffect, useState } from 'react';
import { useWebContext } from 'contexts/Web3';
import { useJoinCommunity, useUserRoleOnCommunity } from 'hooks';

export default function JoinCommunityButton({
  communityId,
  setTotalMembers = () => {},
  // callback to notify leaveCommunity was called
  onLeaveCommunity = async () => {},
}) {
  const { createCommunityUser, deleteUserFromCommunity } = useJoinCommunity();
  const { injectedProvider, user } = useWebContext();

  const isMember = useUserRoleOnCommunity({
    addr: user?.addr,
    communityId,
    roles: ['member'],
  });

  const refresh = (updateFn) => {
    setTotalMembers(updateFn);
  };

  const joinCommunity = async () => {
    const { success } = await createCommunityUser({
      communityId,
      user,
      injectedProvider,
    });
    if (success) {
      refresh((totalMembers) => ++totalMembers);
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
