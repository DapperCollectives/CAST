import React, { useEffect } from 'react';
import { Message, Loader, FadeIn } from 'components';
import CommunitiesPresenter from 'components/Community/CommunitiesPresenter';
import useCommunity from 'hooks/useCommunity';
import useFeaturedCommunities from 'hooks/useFeaturedCommunities';

export default function HomePage() {
  const { data, loading, getCommunities } = useCommunity({ count: 25 });
  const {
    data: featuredCommunities,
    loading: loadingFeaturedCommunities,
    getFeaturedCommunities,
  } = useFeaturedCommunities({ count: 25 });

  useEffect(() => {
    getCommunities();
    getFeaturedCommunities();
  }, [getCommunities, getFeaturedCommunities]);

  const communities = loading
    ? []
    : (data || []).map((datum) => ({
        ...datum,
        // missing fields
        logo: datum.logo || 'https://i.imgur.com/RMKXPCw.png',
        isComingSoon: datum.isComingSoon || false,
      }));

  return (
    <section className="section">
      <Message
        messageText="We are currently in alpha testing with the Flow developer community."
        labelText="Alpha"
      />
      {(loading || loadingFeaturedCommunities) && (
        <div style={{ height: '50vh' }}>
          <Loader fullHeight />
        </div>
      )}
      {!(loading || loadingFeaturedCommunities) && (
        <FadeIn>
          <CommunitiesPresenter title="Communities" communities={communities} />
          <CommunitiesPresenter
            title="Featured Communities"
            communities={featuredCommunities}
          />
        </FadeIn>
      )}
    </section>
  );
}
