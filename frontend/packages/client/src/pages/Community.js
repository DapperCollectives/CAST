import React, { useEffect, useState, useRef } from 'react';
import { useHistory, useParams, Link } from 'react-router-dom';
import {
  Loader,
  CommunityPulse,
  CommunityLinks,
  CommunityMemberList,
  CommunityAbout,
  CommunityProposals,
  LeaderBoard,
  JoinCommunityButton,
  Tablink,
  CommunityHeader,
} from 'components';
import {
  useMediaQuery,
  useCommunityDetails,
  useQueryParams,
  useCommunityUsers,
  useUserRoleOnCommunity,
  useCommunityMembers,
  useWindowDimensions,
} from '../hooks';
import { useWebContext } from '../contexts/Web3';
import { useQueryClient } from 'react-query';

const CommunitySettingsButton = ({ communityId } = {}) => {
  return (
    <div className="columns flex-1" style={{ marginBottom: '20px' }}>
      <div className="column is-11">
        <Link to={`/community/${communityId}/edit`}>
          <div
            className="button is-fullwidth rounded-sm is-uppercase is-flex small-text has-text-white has-background-black"
            style={{ minHeight: '40px' }}
          >
            Community Settings
          </div>
        </Link>
      </div>
    </div>
  );
};

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
        <div className="column pt-3">{communityAbout}</div>
        {leaderBoard && (
          <>
            <hr className="mb-0" style={{ marginTop: '20px' }} />
            <div className="column pt-0">{leaderBoard}</div>
          </>
        )}

        <hr className="my-3" />
        <div className="column">{communityLinks}</div>
        <div className="column">
          {showEdit && <CommunitySettingsButton communityId={communityId} />}
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
            <hr style={{ marginTop: '20px', marginBottom: '20px' }} />
            {communityLinks}
          </>
        ) : (
          <div style={{ paddingTop: '28px' }}>{communityLinks}</div>
        )}
        {showEdit && <hr style={{ marginTop: '32px', marginBottom: '32px' }} />}
        {showEdit && <CommunitySettingsButton communityId={communityId} />}
      </div>
      <div
        className="column pt-0 is-8-desktop is-9-widescreen is-7-tablet"
        style={{ paddingLeft: '12%' }}
      >
        {communityPulse ? (
          <>
            {communityPulse}
            <div style={{ paddingTop: '28px' }}>{communityAbout}</div>
          </>
        ) : (
          <div className="column" style={{ paddingTop: '40px' }}>
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
      <div className="column is-3-desktop is-4-tablet is-hidden-mobile">
        <div style={{ paddingTop: '28px' }}>{communityLinks}</div>
      </div>
      <div
        className="column pt-0 is-9-desktop is-7-tablet"
        style={isMobile ? {} : { paddingLeft: '12%' }}
      >
        {communityMemberList}
      </div>
      <div
        className="column is-3-desktop is-5-tablet is-hidden-tablet"
        style={{ paddingTop: '20px' }}
      >
        {communityLinks}
      </div>
    </div>
  );
};

export default function Community() {
  const queryClient = useQueryClient();

  const { communityId } = useParams();

  const history = useHistory();

  const { width: windowWidth } = useWindowDimensions();
  const [activeWidth, setActiveWidth] = useState(105);
  const [activeLeft, setActiveLeft] = useState(0);

  const { activeTab } = useQueryParams({ activeTab: 'tab' });

  const { data: community, loading, error } = useCommunityDetails(communityId);

  const { strategies } = community || {};

  const {
    user: { addr },
  } = useWebContext();

  const isAdmin = useUserRoleOnCommunity({
    addr,
    communityId,
    roles: ['admin'],
  });

  const { data: admins, reFetch: reFetchAdmins } = useCommunityUsers({
    communityId,
    type: 'admin',
  });

  const { data: authors, reFetch: reFetchAuthors } = useCommunityUsers({
    communityId,
    type: 'author',
  });

  const {
    data: members,
    pagination: { totalRecords },
    queryKey,
  } = useCommunityMembers({ communityId, count: 18 });

  const [totalMembers, setTotalMembers] = useState();
  useEffect(() => {
    setTotalMembers(totalRecords);
  }, [totalRecords]);

  // these two fields should be coming from backend as configuration
  const showPulse = false;
  const showLeaderBoard = true;

  // check for allowing only three options
  if (!['proposals', 'about', 'members'].includes(activeTab)) {
    history.push(`/community/${communityId}?tab=proposals`);
  }
  // navigation from leader board to member list
  const onClickViewMore = () => {
    history.push(`/community/${communityId}?tab=members`);
  };

  const activeTabMap = {
    about: activeTab === 'about',
    proposals: activeTab === 'proposals',
    members: activeTab === 'members',
  };

  const wrapperRef = useRef();
  const aboutRef = useRef();
  const proposalRef = useRef();
  const memberRef = useRef();

  useEffect(() => {
    const refMap = {
      about: aboutRef,
      proposals: proposalRef,
      members: memberRef,
    };
    const el = refMap[activeTab]?.current;
    if (!el) return;

    const elRect = el.getBoundingClientRect();
    const parentRect = wrapperRef.current.getBoundingClientRect();
    const offsetLeft = elRect.left - parentRect.left;
    setActiveWidth(el.offsetWidth);
    setActiveLeft(offsetLeft);
  }, [activeTab, windowWidth]);

  const notMobile = useMediaQuery();

  const onUserLeaveCommunity = async () => {
    // if current user leaving community is admin or author
    // trigger update on admin and author list
    if (authors?.find((author) => author.addr === addr)) {
      await reFetchAuthors();
    }
    if (admins?.find((admin) => admin.addr === addr)) {
      await reFetchAdmins();
    }

    if (members?.find((member) => member.addr === addr)) {
      await queryClient.invalidateQueries(queryKey);
    }
  };

  const onUserJoinCommunity = async () => {
    await queryClient.invalidateQueries(queryKey);
  };

  if (error) {
    // modal will show error message
    // but page cannot render
    // because needs community data
    return null;
  }

  const {
    instagramUrl,
    twitterUrl,
    websiteUrl,
    discordUrl,
    githubUrl,
    logo,
    slug,
    id,
    name,
  } = community ?? {};

  return (
    <section className="full-height pt-0">
      <CommunityHeader
        bannerImgUrl={community?.bannerImgUrl}
        id={id}
        logo={logo}
        slug={slug}
        communityName={name}
        totalMembers={totalMembers}
        members={members?.slice(0, 6)}
        joinCommunityButton={
          <JoinCommunityButton
            communityId={communityId}
            setTotalMembers={setTotalMembers}
            onLeaveCommunity={onUserLeaveCommunity}
            onJoinCommunity={onUserJoinCommunity}
            classNames="mt-2-mobile small-text"
          />
        }
      />
      <div className="section pt-0">
        <div className="container full-height community-content">
          {loading ? (
            <Loader fullHeight />
          ) : (
            <div className="columns m-0 p-0">
              <div className="column p-0">
                <div className="tabs tabs-community is-medium small-text">
                  <ul
                    ref={wrapperRef}
                    className="tabs-community-list"
                    style={{ position: 'relative' }}
                  >
                    <div
                      style={{
                        transition: '0.1s all',
                        position: 'absolute',
                        bottom: 0,
                        height: 2,
                        backgroundColor: '#00EF8B',
                        width: activeWidth,
                        left: activeLeft,
                      }}
                    />
                    <li
                      className={`${
                        activeTabMap['proposals'] ? 'is-active' : ''
                      }`}
                    >
                      <Tablink
                        ref={proposalRef}
                        linkText="Proposals"
                        linkUrl={`/community/${community.id}?tab=proposals`}
                        isActive={activeTabMap['proposals']}
                        className="tab-community pb-4 px-2 mr-4"
                      />
                    </li>
                    <li
                      className={`${
                        activeTabMap['members'] ? 'is-active' : ''
                      }`}
                    >
                      <Tablink
                        ref={memberRef}
                        linkText="Members"
                        linkUrl={`/community/${community.id}?tab=members`}
                        isActive={activeTabMap['members']}
                        className="tab-community pb-4 px-2 mx-4"
                      />
                    </li>
                    <li
                      className={`${activeTabMap['about'] ? 'is-active' : ''}`}
                    >
                      <Tablink
                        ref={aboutRef}
                        linkText="About"
                        linkUrl={`/community/${community.id}?tab=about`}
                        isActive={activeTabMap['about']}
                        className="tab-community pb-4 px-2 ml-4"
                      />
                    </li>
                  </ul>
                </div>
                {activeTabMap['about'] && (
                  <AboutLayout
                    isMobile={!notMobile}
                    communityPulse={showPulse && <CommunityPulse />}
                    leaderBoard={
                      showLeaderBoard && (
                        <LeaderBoard
                          onClickViewMore={onClickViewMore}
                          communityId={community.id}
                        />
                      )
                    }
                    communityLinks={
                      <CommunityLinks
                        instagramUrl={instagramUrl}
                        twitterUrl={twitterUrl}
                        websiteUrl={websiteUrl}
                        discordUrl={discordUrl}
                        githubUrl={githubUrl}
                      />
                    }
                    communityAbout={
                      <CommunityAbout
                        isMobile={!notMobile}
                        textAbout={
                          community?.about?.textAbout || community?.body
                        }
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
                {activeTabMap['proposals'] && (
                  <CommunityProposals
                    communityId={community.id}
                    admins={admins ?? []}
                  />
                )}
                {activeTabMap['members'] && (
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
      </div>
    </section>
  );
}
