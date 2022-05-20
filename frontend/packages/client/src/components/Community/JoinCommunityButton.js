import React, { useState } from "react";
import { useWebContext } from "contexts/Web3";
import { useJoinCommunity, useUserRoleOnCommunity } from "hooks";

export default function JoinCommunityButton({
  alignment = "flex-end",
  communityId,
  setTotalMembers = () => { },
}) {
  const { createCommunityUser, deleteUserFromCommunity } = useJoinCommunity();
  const { injectedProvider, user } = useWebContext();
  const { addr } = user;
  const memberState = useUserRoleOnCommunity({
    addr,
    communityId,
    roles: ["member"],
  });
  const [isMember, setMemberState] = useState(memberState);
  const [btnText, setBtnText] = useState(isMember ? "Leave" : "Join");

  const joinCommunity = async () => {
    const { success } = await createCommunityUser(
      communityId,
      user,
      injectedProvider
    );
    if (success) {
      setMemberState(true);
      setBtnText("Leave");
      setTotalMembers((totalMembers) => ++totalMembers);
    }
  };

  const leaveCommunity = async () => {
    const { success } = await deleteUserFromCommunity(
      communityId,
      user,
      injectedProvider
    );
    if (success) {
      setMemberState(false);
      setBtnText("Join");
      setTotalMembers((totalMembers) => --totalMembers);
    }
  };

  const handleMembership = () => isMember ? leaveCommunity() : joinCommunity();

  return (
    <>
      <div
        className={`column is-narrow-tablet is-full-mobile is-align-self-${alignment}`}
        style={{ minWidth: "117px" }}
      >
        <button
          className="button is-uppercase is-fullwidth"
          style={{
            backgroundColor: "black",
            borderRadius: "200px",
            color: "white",
          }}
          onClick={handleMembership}
        >
          {btnText}
        </button>
      </div>
    </>
  );
}
