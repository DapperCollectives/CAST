import React from "react";
import { Link } from "react-router-dom";
import ProposalHeader from "./ProposalsList/ProposalHeader";
import Loader from "./Loader";

const StyleForStatus = {
  closed: { opacity: 0.6 },
  cancelled: { opacity: 0.6 },
};

const EmptyPlaceHolder = ({ communityId }) => {
  return (
    <div className="is-flex is-flex-direction-column">
      <div className="border-light rounded-sm mb-5">
        <div className="px-5 py-5 proposal-body-spacing">
          <p
            className="has-text-weight-bold has-text-grey mb-4"
            style={{ fontSize: "18px" }}
          >
            Looks like there’s nothing to vote on yet...
          </p>
          <p className="has-text-grey mb-4 small-text">
            What will your community’s first proposal be?
          </p>
          <Link to={`/proposal/create?communityId=${communityId}`}>
            <p className="small-text">
              Click here to start creating a proposal now
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};
const CommunityProposalList = ({
  proposalsList,
  initialLoading,
  activeProposals = [],
  filterValue,
  communityId,
} = {}) => {
  // filter with all value should show active and pending in one group and closed and cancelled in another group
  if (filterValue === "all") {
    const listIsEmpty =
      proposalsList?.length === 0 && activeProposals?.length === 0;
    return (
      <>
        {initialLoading && <Loader fullHeight />}
        {listIsEmpty && <EmptyPlaceHolder communityId={communityId} />}
        {/* If there's an element in any of the two lists they will render */}
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
        {proposalsList?.length !== 0 && (
          <div className="has-text-weight-bold is-uppercase mb-5">Closed</div>
        )}
        <div className="is-flex is-flex-direction-column">
          {(proposalsList ?? []).map((pr, i) => (
            <Link
              to={`/proposal/${pr.id}`}
              key={i}
              style={StyleForStatus[pr.computedStatus] ?? {}}
            >
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
          <Link
            to={`/proposal/${pr.id}`}
            key={i}
            style={StyleForStatus[pr.computedStatus] ?? {}}
          >
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
