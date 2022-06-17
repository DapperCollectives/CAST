import React, { useState, useCallback, useEffect } from "react";
import { Link, useParams, useHistory } from "react-router-dom";
import { useWebContext } from "contexts/Web3";
import {
  CommunityEditorProfile,
  CommunityEditorLinks,
  CommunityEditorDetails,
  CommunityPropsAndVoting,
  Dropdown,
  Loader,
} from "components";
import { ArrowLeft, ArrowLeftBold } from "components/Svg";
import {
  useCommunityDetails,
  useMediaQuery,
  useFileUploader,
  useUserRoleOnCommunity,
} from "hooks";

const MenuTabs = ({ tabs, communityId, onClickButtonTab = () => {} } = {}) => {
  return (
    <div>
      <div className="is-flex pl-2 mb-6">
        <Link to={`/community/${communityId}?tabs=proposals`}>
          <span className="has-text-grey is-flex is-align-items-center back-button transition-all">
            <ArrowLeft /> <span className="ml-3">Back</span>
          </span>
        </Link>
      </div>

      <div className="is-flex flex-1">
        <p className="px-2 has-text-weight-bold">Edit Profile</p>
      </div>
      <div className="is-flex flex-1" style={{ marginTop: "36px" }}>
        <button
          className={`button is-white px-2 small-text ${
            tabs.profile ? "has-text-weight-bold" : ""
          }`}
          onClick={onClickButtonTab("profile")}
        >
          Community Profile
        </button>
      </div>
      <div className="is-flex flex-1" style={{ marginTop: "18px" }}>
        <button
          className={`button is-white px-2 small-text ${
            tabs.details ? "has-text-weight-bold" : ""
          }`}
          onClick={onClickButtonTab("details")}
        >
          Community Details
        </button>
      </div>
      <div className="is-flex flex-1" style={{ marginTop: "18px" }}>
        <button
          className={`button is-white px-2 small-text ${
            tabs.details ? "has-text-weight-bold" : ""
          }`}
          onClick={onClickButtonTab("proposals-and-voting")}
        >
          Proposals & Voting
        </button>
      </div>
    </div>
  );
};

const DropdownMenu = ({ communityId, onClickButtonTab = () => {} } = {}) => {
  return (
    <div>
      <div className="columns is-mobile">
        <div
          className="column is-flex is-align-center"
          style={{ width: "100%" }}
        >
          <Link to={`/community/${communityId}?tabs=about`}>
            <ArrowLeftBold />
          </Link>
          <p
            className="px-2 is-flex is-justify-content-center has-text-weight-bold"
            style={{ width: "calc(100% - 37px)" }}
          >
            Edit Profile
          </p>
        </div>
      </div>
      <Dropdown
        defaultValue="profile"
        values={[
          { label: "Community Profile", value: "profile" },
          { label: "Community Details", value: "details" },
          { label: "Proposals & Voting", value: "proposals-and-voting" },
        ]}
        onSelectValue={(value) => {
          onClickButtonTab(value)();
        }}
      />
    </div>
  );
};
export default function CommunityEditorPage() {
  const { communityId } = useParams();
  const history = useHistory();
  const {
    user: { addr },
  } = useWebContext();
  const {
    data: community,
    loading,
    updateCommunityDetails,
  } = useCommunityDetails(communityId);

  const { uploadFile } = useFileUploader();
  const notMobile = useMediaQuery();

  const [tabs, setTab] = useState({ profile: true, details: false });

  const onClickButtonTab = (value) => () => {
    setTab({
      profile: value === "profile",
      details: value === "details",
      proposalsAndVoting: value === "proposals-and-voting",
    });
  };

  const updateCommunity = useCallback(
    async (updateData) => updateCommunityDetails(communityId, updateData),
    [communityId, updateCommunityDetails]
  );

  const isAdmin = useUserRoleOnCommunity({
    addr,
    communityId,
    roles: ["admin"],
  });

  // when user is connected to wallet it checks if role is admin
  // then it allows to stay in edit page,
  // otherwise it's redirected to previous location
  useEffect(() => {
    if ((!isAdmin && addr === null) || (isAdmin === false && addr)) {
      history.push("/");
      return;
    }
  }, [isAdmin, addr, history]);

  // initial loading
  if (loading && !community) {
    return (
      <section className="section">
        <div className="container is-flex full-height">
          <Loader fullHeight />
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container is-flex full-height">
        <div className="columns flex-1">
          {/* left panel */}
          <div className="column is-4">
            {notMobile ? (
              <MenuTabs
                tabs={tabs}
                onClickButtonTab={onClickButtonTab}
                communityId={community?.id}
              />
            ) : (
              <DropdownMenu
                tabs={tabs}
                onClickButtonTab={onClickButtonTab}
                communityId={community?.id}
              />
            )}
          </div>
          {/* right panel */}
          <div className="column is-7 is-8-tablet is-flex is-flex-direction-column flex-1">
            {tabs.profile && (
              <>
                <CommunityEditorProfile
                  name={community?.name}
                  body={community?.body}
                  logo={community?.logo}
                  updateCommunity={updateCommunity}
                  uploadFile={uploadFile}
                />
                <CommunityEditorLinks
                  websiteUrl={community?.websiteUrl}
                  twitterUrl={community?.twitterUrl}
                  instagramUrl={community?.instagramUrl}
                  discordUrl={community?.discordUrl}
                  githubUrl={community?.githubUrl}
                  updateCommunity={updateCommunity}
                />
              </>
            )}
            {tabs.details && (
              <CommunityEditorDetails communityId={community?.id} />
            )}
            {tabs.proposalsAndVoting && (
              <CommunityPropsAndVoting
                communityId={community?.id}
                updateCommunity={updateCommunity}
                updatingCommunity={loading}
                communityVotingStrategies={community.strategies}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
