import React from "react";
import { Star } from "components/Svg";
import Blockies from "react-blockies";
import { useUserRoleOnCommunity } from "hooks";
import { useParams } from "react-router-dom";

const ProposalCardHeader = ({ creatorAddr }) => {
  const { communityId } = useParams();
  const isAdmin = useUserRoleOnCommunity({
    creatorAddr,
    communityId,
    roles: ["admin"],
  });
  return (
    <div
      className={"is-flex is-align-items-center pb-3"}
    >
      <Blockies seed={creatorAddr} size={6} scale={4} className="blockies" />
      <span className="pl-2 pr-1 has-text-black is-size-7">{creatorAddr}</span>
      {isAdmin && <Star fill="#F4AF4A" width="12" height="12" />}
    </div>
  );
};

export default ProposalCardHeader;
