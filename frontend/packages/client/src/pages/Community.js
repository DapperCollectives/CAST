import React from "react";
import { useHistory, useParams, Link } from "react-router-dom";
import { Tablink } from "components/ProposalsList";
import {
  Loader,
  CommunityPulse,
  CommunityLinks,
  CommunityMemberList,
  CommunityAbout,
  CommunityProposals,
  LeaderBoard,
} from "components";
import {
  useMediaQuery,
  useCommunityDetails,
  useQueryParams,
  useCommunityUsers,
  useVotingStrategies,
  useUserRoleOnCommunity,
} from "hooks";
import { useWebContext } from "contexts/Web3";

const AboutLayout = ({
  isMobile,
  leaderBoard,
  communityLinks,
  communityPulse,
  communityAbout,
  communityId,
  showEdit,
} = {}) => {
  if (isMobile) {
    return (
      <div className="columns mt-0">
        {communityPulse && <div className="column">{communityPulse}</div>}
        <div className="column" style={{ paddingTop: "12px" }}>
          {communityAbout}
        </div>
        {leaderBoard && (
          <>
            <hr style={{ marginTop: "20px", marginBottom: "0px" }} />
            <div className="column pt-0">{leaderBoard}</div>
          </>
        )}

        <hr style={{ marginTop: "12px", marginBottom: "12px" }} />
        <div className="column">{communityLinks}</div>
        <div className="column">
          <p className="smaller-text has-text-grey">Founded 2022</p>
        </div>
      </div>
    );
  }
  return (
    <div className="columns mt-0">
      <div className="column is-4-desktop is-3-widescreen is-4-tablet">
        {leaderBoard ? (
          <>
            {leaderBoard}
            <hr style={{ marginTop: "20px", marginBottom: "20px" }} />
            {communityLinks}
          </>
        ) : (
          <div style={{ paddingTop: "28px" }}>{communityLinks}</div>
        )}
        <hr style={{ marginTop: "32px", marginBottom: "32px" }} />
        {showEdit && (
          <div className="columns flex-1" style={{ marginBottom: "20px" }}>
            <div className="column is-11">
              <Link to={`/community/${communityId}/edit`}>
                <div
                  className="button is-fullwidth rounded-sm is-uppercase is-flex small-text has-text-white has-background-black"
                  style={{ minHeight: "40px" }}
                >
                  Community Settings
                </div>
              </Link>
            </div>
          </div>
        )}
        <p className="smaller-text has-text-grey">Founded 2022</p>
      </div>
      <div
        className="column is-8-desktop is-9-widescreen is-7-tablet"
        style={{ paddingLeft: "12%" }}
      >
        {communityPulse ? (
          <>
            {communityPulse}
            <div style={{ paddingTop: "28px" }}>{communityAbout}</div>
          </>
        ) : (
          <div className="column" style={{ paddingTop: "40px" }}>
            {communityAbout}
          </div>
        )}
      </div>
    </div>
  );
};

const MembersLayout = ({
  communityLinks,
  communityMemberList,
  isMobile,
} = {}) => {
  return (
    <div className="columns mt-0">
      <div
        className="column is-3-desktop is-4-tablet is-hidden-mobile"
        style={{ paddingTop: "28px" }}
      >
        {communityLinks}
        <hr style={{ marginTop: "32px", marginBottom: "32px" }} />
        <p className="smaller-text has-text-grey">Founded 2022</p>
      </div>
      <div
        className="column pt-0 is-9-desktop is-7-tablet"
        style={isMobile ? {} : { paddingLeft: "12%" }}
      >
        {communityMemberList}
      </div>
      <div
        className="column is-3-desktop is-5-tablet is-hidden-tablet"
        style={{ paddingTop: "20px" }}
      >
        {communityLinks}
        <hr style={{ marginTop: "32px", marginBottom: "32px" }} />
        <p className="smaller-text has-text-grey">Founded 2022</p>
      </div>
    </div>
  );
};

export default function CommunityPage() {
  const { communityId } = useParams();

  const history = useHistory();

  const { activeTab } = useQueryParams({ activeTab: "tab" });

  const { data: community, loading, error } = useCommunityDetails(communityId);

  const {
    user: { addr },
  } = useWebContext();

  const isAdmin = useUserRoleOnCommunity({
    addr,
    communityId,
    roles: ["admin"],
  });

  const { data: admins } = useCommunityUsers({ communityId, type: "admin" });
  const { data: authors } = useCommunityUsers({ communityId, type: "author" });

  const { data: strategies } = useVotingStrategies();

  // these two fields should be coming from backend as configuration
  const showPulse = false;
  const showLeaderBoard = false;

  // check for allowing only three options
  if (!["proposals", "about", "members"].includes(activeTab)) {
    history.push(`/community/${communityId}?tab=about`);
  }
  // navigation from leader board to member list
  const onClickViewMore = () => {
    history.push(`/community/${communityId}?tab=members`);
  };

  const activeTabMap = {
    about: activeTab === "about",
    proposals: activeTab === "proposals",
    members: activeTab === "members",
  };

  const notMobile = useMediaQuery();

  const ulClassName = !notMobile ? "is-justify-content-space-around" : "";

  if (error) {
    // modal will show error message
    // but page cannot render
    // because needs community data
    return null;
  }

  const { instagramUrl, twitterUrl, websiteUrl, discordUrl } = community ?? {};

  return (
    <section className="section full-height">
      <div className="container full-height">
        {loading && <Loader fullHeight />}
        {!loading && (
          <div className="columns m-0 p-0">
            <div className="column p-0">
              <div className="tabs tabs-community is-medium small-text">
                <ul className={ulClassName}>
                  <li className={`${activeTabMap["about"] ? "is-active" : ""}`}>
                    <Tablink
                      linkText="About"
                      linkUrl={`/community/${community.id}?tab=about`}
                      isActive={activeTabMap["about"]}
                      className="tab-community pb-4 pl-2 pr-0 mr-4"
                    />
                  </li>
                  <li
                    className={`${
                      activeTabMap["proposals"] ? "is-active" : ""
                    }`}
                  >
                    <Tablink
                      linkText="Proposals"
                      linkUrl={`/community/${community.id}?tab=proposals`}
                      isActive={activeTabMap["proposals"]}
                      className="tab-community pb-4 pr-1 pl-0 mx-4"
                    />
                  </li>
                  <li
                    className={`${activeTabMap["members"] ? "is-active" : ""}`}
                  >
                    <Tablink
                      linkText="Members"
                      linkUrl={`/community/${community.id}?tab=members`}
                      isActive={activeTabMap["members"]}
                      className="tab-community pb-4 pr-1 pl-0 ml-4"
                    />
                  </li>
                </ul>
              </div>
              {activeTabMap["about"] && (
                <AboutLayout
                  isMobile={!notMobile}
                  communityPulse={showPulse && <CommunityPulse />}
                  leaderBoard={
                    showLeaderBoard && (
                      <LeaderBoard onClickViewMore={onClickViewMore} />
                    )
                  }
                  communityLinks={
                    <CommunityLinks
                      instagramUrl={instagramUrl}
                      twitterUrl={twitterUrl}
                      websiteUrl={websiteUrl}
                      discordUrl={discordUrl}
                    />
                  }
                  communityAbout={
                    <CommunityAbout
                      isMobile={!notMobile}
                      textAbout={community?.about?.textAbout || community?.body}
                      adminMembers={(admins ?? []).map((admin) => ({
                        name: admin.addr,
                      }))}
                      authorsMembers={(authors ?? []).map((admin) => ({
                        name: admin.addr,
                      }))}
                      strategies={(strategies ?? []).map((strategy) => ({
                        name: strategy.name,
                      }))}
                    />
                  }
                  showEdit={isAdmin}
                  communityId={communityId}
                />
              )}
              {activeTabMap["proposals"] && <CommunityProposals />}
              {activeTabMap["members"] && (
                <MembersLayout
                  isMobile={!notMobile}
                  communityLinks={
                    <CommunityLinks
                      instagramUrl={instagramUrl}
                      twitterUrl={twitterUrl}
                      websiteUrl={websiteUrl}
                      discordUrl={discordUrl}
                    />
                  }
                  communityMemberList={
                    <CommunityMemberList communityId={community.id} />
                  }
                />
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
