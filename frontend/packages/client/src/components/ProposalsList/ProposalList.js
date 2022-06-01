import React from "react";
import { Link } from "react-router-dom";
import DropDownFilter from "./DropdownFilter";
import ProposalHeader from "./ProposalHeader";
import Loader from "../Loader";

// Used for adding margin on mobile to children
const PaddingWrapper = ({ children }) => {
  return (
    <>
      <div className="is-hidden-mobile column p-0">{children}</div>
      <div className="is-hidden-tablet column p-0 mt-2 mb-5">{children}</div>
    </>
  );
};

const ProposalList = ({
  proposalsList,
  proposalFilterValues,
  setFilterValues = () => {},
  filterValue,
  initialLoading,
} = {}) => {
  return (
    <>
      <div className="columns m-0">
        <div className="column p-0 is-10-tablet is-hidden-mobile">
          <h1 className="title is-4 mb-6" style={{ lineHeight: "1.67" }}>
            Proposals
          </h1>
        </div>
        <PaddingWrapper>
          <DropDownFilter
            value={filterValue}
            filterValues={proposalFilterValues}
            setFilterValues={setFilterValues}
            className="is-hidden-tablet"
          />
        </PaddingWrapper>
      </div>
      {initialLoading && <Loader fullHeight />}
      <div className="is-flex is-flex-direction-column">
        {(proposalsList ?? []).map((pr, i) => (
          <Link to={`/proposal/${pr.id}`} key={i} data-testid="proposal-card">
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

export default ProposalList;
