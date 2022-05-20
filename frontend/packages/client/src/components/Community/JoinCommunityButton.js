import React, { useEffect, useState } from "react";
import { useWebContext } from "../../contexts/Web3";
import { useJoinCommunity, useUserRoleOnCommunity } from "../../hooks";

export default function JoinCommunityButton({
  enableJoin = false,
  alignment = "flex-end",
  communityId,
  setTotalMembers = () => {},
}) {
  const [joinedBtnText, toggleJoinedBtnText] = useState("Joined");
  const [borderColor, setBorderColor] = useState("transparent");
  const [isMember, setMemberState] = useState(false);
  const { createCommunityUser, deleteUserFromCommunity } = useJoinCommunity();
  const { injectedProvider, user } = useWebContext();
  const { addr } = user;
  const memberState = useUserRoleOnCommunity({
    addr,
    communityId,
    roles: ["member"],
  });

  useEffect(() => {
    setMemberState(memberState);
  }, [memberState]);

  const handleHover = () => (isMember ? hoverToggle() : () => {});

  const hoverToggle = () => {
    if (joinedBtnText === "Joined") {
      toggleJoinedBtnText("Leave");
      setBorderColor("#FBD84D"); // defined in App.sass
    } else {
      toggleJoinedBtnText("Joined");
      setBorderColor("transparent");
    }
  };

  const joinCommunity = async () => {
    const { success } = await createCommunityUser(
      communityId,
      user,
      injectedProvider
    );
    if (success) {
      setMemberState(true);
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
      setTotalMembers((totalMembers) => --totalMembers);
    }
  };

  const handleMembership = () =>
    !isMember ? joinCommunity() : leaveCommunity();

  const btnText = () => (!isMember ? "Join" : joinedBtnText);

  return (
    <>
      {enableJoin && (
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
              borderColor: borderColor,
            }}
            onClick={handleMembership}
            onMouseEnter={handleHover}
            onMouseLeave={handleHover}
          >
            {btnText()}
          </button>
        </div>
      )}
    </>
  );
}
