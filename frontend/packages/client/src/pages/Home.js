import React from 'react';
import classnames from 'classnames';
import { Loader, FadeIn, HomeFooter, HomeHeader } from 'components';
import { useWebContext } from 'contexts/Web3';
import CommunitiesPresenter from 'components/Community/CommunitiesPresenter';
import useUserCommunities from 'hooks/useUserCommunities';
import useFeaturedCommunities from 'hooks/useFeaturedCommunities';

export default function HomePage() {
  const {
    user: { addr },
  } = useWebContext();
  const { data: communityUser, loading } = useUserCommunities({
    addr,
    count: 100,
    initialLoading: false,
  });

  const { isLoading: loadingFeaturedCommunities, data: featuredCommunities } =
    useFeaturedCommunities();

  let myUserCommunities = loading
    ? []
    : (communityUser || []).map((datum) => ({
        ...datum,
        // missing fields
        isComingSoon: datum.isComingSoon || false,
      }));

  // Remove duplicates from array
  myUserCommunities = myUserCommunities.filter(
    (value, index, self) =>
      index === self.findIndex((t) => t.name === value.name)
  );

  const isMyCommunitiesVisible = myUserCommunities.length > 0;

  const classNamesFeatCommunities = classnames('', {
    'pt-6-mobile pt-6-tablet pt-9-desktop': isMyCommunitiesVisible,
  });

  return (
    <section className="section">
      <HomeHeader />
      {(loading || loadingFeaturedCommunities) && (
        <div style={{ height: '50vh' }}>
          <Loader fullHeight />
        </div>
      )}
      {!(loading || loadingFeaturedCommunities) && (
        <FadeIn>
          {isMyCommunitiesVisible && (
            <CommunitiesPresenter
              title="My Communities"
              communities={myUserCommunities}
            />
          )}
          <CommunitiesPresenter
            classNames={classNamesFeatCommunities}
            title="Featured Communities"
            communities={featuredCommunities}
          />
        </FadeIn>
      )}
      <HomeFooter />
    </section>
  );
}
