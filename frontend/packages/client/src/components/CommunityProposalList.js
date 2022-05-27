import React from "react";
import Loader from "./Loader";
import ProposalCard from "./ProposalsList/ProposalCard";

const CommunityProposalList = ({
  proposalsList,
  initialLoading,
  activeProposals = [],
  filterValue,
} = {}) => {
  // filter with all value should show active and pending in one group and closed and cancelled in another group
  if (filterValue === "all") {
    return (
      <>
        {initialLoading && <Loader fullHeight />}
        <div className="is-flex is-flex-direction-column">
          {(activeProposals ?? []).map((pr, i) => (<ProposalCard pr={pr} key={i} />))}
        </div>
        <div className="has-text-weight-bold is-uppercase mb-5">Closed</div>
        <div className="is-flex is-flex-direction-column">
          {(proposalsList ?? []).map((pr, i) => (<ProposalCard pr={pr} style={{ opacity: "50%" }} key={i} />))}
        </div>
      </>
    );
  }
  // all other filter status
  return (
    <>
      {initialLoading && <Loader fullHeight />}
      <div className="is-flex is-flex-direction-column">
        {(proposalsList ?? []).map((pr, i) => (<ProposalCard pr={pr} key={i} />))}
      </div>
    </>
  );
};

export default CommunityProposalList;
