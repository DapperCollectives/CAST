import React from "react";
import { Link } from "react-router-dom";
import ProposalHeader from "./ProposalsList/ProposalHeader";
import Loader from "./Loader";
import { FilterValues } from "../const";

const CommunityProposalList = ({
  proposalsList,
  initialLoading,
  activeProposals = [],
  filterValue,
} = {}) => {
  // filter with active
  if (filterValue === FilterValues["all"]) {
    return (
      <>
        {initialLoading && <Loader fullHeight />}
        <div className="is-flex is-flex-direction-column">
          {(activeProposals ?? []).map((pr, i) => (
            <Link to={`/proposal/${pr.id}`} key={i}>
              <div
                className="border-light rounded-sm mb-5 proposal-card transition-all"
                key={i}
              >
                <ProposalHeader {...pr} />
                <div className="px-6 py-5 proposal-body-spacing">
                  <h4 className="proposal-title is-4 mt-1 mb-2">{pr.name}</h4>
                  <p className="has-text-grey mb-4 small-text">
                    by {pr.creatorAddr}
                  </p>
                  <p className="has-text-grey small-text">{pr.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="has-text-weight-bold is-uppercase mb-5">Closed</div>
        <div className="is-flex is-flex-direction-column">
          {(proposalsList ?? []).map((pr, i) => (
            <Link to={`/proposal/${pr.id}`} key={i}>
              <div
                className="border-light rounded-sm mb-5 proposal-card transition-all"
                key={i}
              >
                <ProposalHeader {...pr} />
                <div className="px-6 py-5 proposal-body-spacing">
                  <h4 className="proposal-title is-4 mt-1 mb-2">{pr.name}</h4>
                  <p className="has-text-grey mb-4 small-text">
                    by {pr.creatorAddr}
                  </p>
                  <p className="has-text-grey small-text">{pr.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </>
    );
  }
  // all other filter status
  return (
    <>
      {initialLoading && <Loader fullHeight />}
      <div className="is-flex is-flex-direction-column">
        {(proposalsList ?? []).map((pr, i) => (
          <Link to={`/proposal/${pr.id}`} key={i}>
            <div
              className="border-light rounded-sm mb-5 proposal-card transition-all"
              key={i}
            >
              <ProposalHeader {...pr} />
              <div className="px-6 py-5 proposal-body-spacing">
                <h4 className="proposal-title is-4 mt-1 mb-2">{pr.name}</h4>
                <p className="has-text-grey mb-4 small-text">
                  by {pr.creatorAddr}
                </p>
                <p className="has-text-grey small-text">{pr.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
};

export default CommunityProposalList;
