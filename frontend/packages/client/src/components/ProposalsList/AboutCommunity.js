import React from "react";
import Blockies from "react-blockies";

const CommunityMemberInfo = ({ name }) => {
  return (
    <div className="is-flex is-align-items-center py-3">
      <div className="is-flex pr-2">
        <Blockies seed={name} size={8} scale={4} className="blockies" />
      </div>
      <div className="subtitle has-text-grey small-text">{name}</div>
    </div>
  );
};

const RoleTitle = ({ role }) => {
  return (
    <div className="column is-12 pl-0 pb-1">
      <h6 className="subtitle small-text pb-2 pt-4">{role}</h6>
    </div>
  );
};

const AboutCommunity = ({
  textAbout = "",
  adminMembers = [],
  authorsMembers = [],
} = {}) => {
  return (
    <>
      <h1 className="title is-4 mb-5 is-hidden-mobile">About</h1>
      <p className="mb-5 has-text-grey">{textAbout}</p>
      <div className="divider py-2" />
      <RoleTitle role={"Admin"} />
      {adminMembers.map((item, index) => (
        <CommunityMemberInfo name={item.name} key={`member-${index}`} />
      ))}
      <div className="divider py-2" />
      <RoleTitle role={"Authors"} />
      {authorsMembers.map((item, index) => (
        <CommunityMemberInfo name={item.name} key={`member-${index}`} />
      ))}
    </>
  );
};
export default AboutCommunity;
