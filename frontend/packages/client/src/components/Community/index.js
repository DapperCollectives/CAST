import React, { useState } from "react";
import { Add } from "components/Svg";
import { Link } from "react-router-dom";
import { useCommunityProposalsWithVotes, useAllowlist } from "hooks";
import ProposalList, {
  AboutCommunity,
  Tablink,
} from "components/ProposalsList/index";
import { FilterValues } from "const";

const Community = ({ community, activeTab, enableJoin = false }) => {
  const activeTabMap = {
    proposals: activeTab === "proposals",
    about: activeTab === "about",
  };

  const { description = "" } = community;

  const hasDescription = description.length > 0;

  const proposalFilterValues = Object.values(FilterValues);

  const [filterValue, setFilterValues] = useState(FilterValues["all"]);

  const { data: proposals, loading: loadingProposals } =
    useCommunityProposalsWithVotes({
      communityId: community.id,
      count: 10,
      status:
        filterValue.toLocaleLowerCase() === "all"
          ? null
          : filterValue.toLocaleLowerCase(),
    });

  const { data: allowList } = useAllowlist();
  // for now allowlist just returns addresses so use that as name...
  const admins = (allowList ?? []).map((d) => ({ name: d }));
  const authors = (allowList ?? []).map((d) => ({ name: d }));

  return (
    <div className="columns flex-1 m-0">
      <div className="column is-3 has-background-white-ter spacing-left-panel">
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "50%",
            height: "100%",
            zIndex: -1,
          }}
          className="is-hidden-mobile has-background-white-ter"
        />
        {/* left panel */}
        <div className="is-hidden-tablet columns is-mobile is-flex-grow-1 mt-2 mx-0 mb-0">
          <div className="is-inline is-4">
            <img alt="community banner" className="mb-4" src={community.logo} />
          </div>
          <div className="column is-flex- is-align-items-center is-8 pb-0">
            <div className="columns is-multiline">
              <h2 className="column is-12 title is-4 mb-0">{community.name}</h2>
            </div>
          </div>
        </div>
        <div className="is-hidden-mobile">
          <img alt="community banner" className="mb-5" src={community.logo} />
          <h2 className="title is-4 mb-2">{community.name}</h2>
        </div>
        <div className="columns is-hidden-tablet is-mobile mx-0 my-0">
          {enableJoin && (
            <div className="column is-6 pl-0 pr-1 py-0">
              <div className="button is-black rounded-sm is-uppercase is-flex is-9 small-text">
                Join
              </div>
            </div>
          )}
          <div className={`column py-0 ${enableJoin ? "pl-1 pr-0" : "px-0"}`}>
            <Link to={`/proposal/create?communityId=${community.id}`}>
              <div className="button rounded-sm is-outlined is-uppercase is-flex is-9 small-text has-text-black">
                Create Proposal
              </div>
            </Link>
          </div>
        </div>
        {enableJoin && (
          <div className="button is-transparent rounded-sm is-outlined is-uppercase is-flex is-4-mobile is-hidden-mobile">
            Join
          </div>
        )}
        {hasDescription ? (
          <div className="columns is-hidden-tablet is-mobile m-0">
            <div className="column px-0 pt-5" style={{ paddingBottom: "40px" }}>
              <p className="has-text-grey small-text">{description}</p>
            </div>
          </div>
        ) : (
          <div style={{ height: "100px" }} />
        )}
        <hr className="mt-6 mb-6 is-hidden-mobile" />
        <div className="mb-6 is-hidden-mobile">
          <Tablink
            linkText="Proposals"
            linkUrl={`/community/${community.id}?tab=proposals`}
            isActive={activeTabMap["proposals"]}
            animateHover
          />
        </div>
        <div className="mb-6 is-hidden-mobile">
          <Tablink
            linkText="About"
            linkUrl={`/community/${community.id}?tab=about`}
            isActive={activeTabMap["about"]}
            animateHover
          />
        </div>
        <hr className="mb-6 is-hidden-mobile" />
        <div className="mb-4 is-flex is-hidden-mobile tab-link transition-all">
          <Link to="/proposal/create">
            <div className="is-flex">
              <span className="mr-2">
                <Add />
              </span>
              <p className="has-text-black">Create New Proposal</p>
            </div>
          </Link>
        </div>
        <div className="is-hidden-tablet">
          <div className="tabs is-medium">
            <ul>
              <li className={`${activeTabMap["proposals"] ? "is-active" : ""}`}>
                <Tablink
                  linkText="Proposals"
                  linkUrl={`/community/${community.id}?tab=proposals`}
                  isActive={activeTabMap["proposals"]}
                  onlyLink
                />
              </li>
              <li className={`${activeTabMap["about"] ? "is-active" : ""}`}>
                <Tablink
                  linkText="About"
                  linkUrl={`/community/${community.id}?tab=about`}
                  isActive={activeTabMap["about"]}
                  onlyLink
                />
              </li>
            </ul>
          </div>
        </div>
      </div>
      {/* Right Panel */}
      <div className="column is-flex is-9 p-0 is-flex-wrap-wrap">
        <div className="is-flex is-flex-direction-column flex-1 has-background-white spacing-right-panel">
          {activeTabMap["proposals"] ? (
            <>
              <ProposalList
                proposalsList={proposals}
                proposalFilterValues={proposalFilterValues}
                setFilterValues={setFilterValues}
                filterValue={filterValue}
                initialLoading={loadingProposals && !proposals}
              />

              {loadingProposals && Array.isArray(proposals) && (
                <div className="has-text-grey mb-4 py-5 is-flex is-justify-content-center">
                  <p>Loading more...</p>
                </div>
              )}
            </>
          ) : (
            <AboutCommunity
              textAbout={community.about.textAbout}
              adminMembers={admins}
              authorsMembers={authors}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Community;
