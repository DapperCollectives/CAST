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
  const [addr, setAddr] = useState();
  const memberState = useUserRoleOnCommunity({
    addr,
    communityId,
    roles: ['member'],
  });
  const [isMember, setIsMember] = useState();

  useEffect(() => {
    setAddr(user.addr);
    setIsMember(memberState);
  }, [user.addr, memberState]);

  const refresh = (updateFn) => {
    // setting this to null and then to a valid address retriggers query to get memberState
    setAddr(null);
    setAddr(user.addr);
    setTotalMembers(updateFn);
  };

  const joinCommunity = async () => {
    const { success } = await createCommunityUser(
      communityId,
      user,
      injectedProvider
    );
    if (success) {
      refresh((totalMembers) => ++totalMembers);
    }
  };

  const leaveCommunity = async () => {
    const { success } = await deleteUserFromCommunity(
      communityId,
      user,
      injectedProvider
    );

    if (success) {
      refresh((totalMembers) => --totalMembers);
      onLeaveCommunity();
    }
  };

  if (!addr || (isMember !== true && isMember !== false)) return null;

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
