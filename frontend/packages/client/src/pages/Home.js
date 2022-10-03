import { useEffect } from 'react';
import { useWebContext } from 'contexts/Web3';
import {
  BrowseCommunityButton,
  FadeIn,
  HomeFooter,
  HomeHeader,
  Loader,
  TooltipMessage,
} from 'components';
import CommunitiesPresenter from 'components/Community/CommunitiesPresenter';
import {
  useBrowserName,
  useFeaturedCommunities,
  useLocalStorage,
  useUserCommunities,
} from 'hooks';
import SectionContainer from 'layout/SectionContainer';

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

  const browserName = useBrowserName();

  const [showToolTip, setValue] = useLocalStorage('dw-safary-tooltip', null);

  useEffect(() => {
    const isSafari = 'Apple Safari' === browserName;
    if (isSafari && showToolTip === null) {
      setValue(true);
    }
  }, [browserName, setValue, showToolTip]);

  const isUserWalletConnected = !!addr;

  const isMyCommunitiesVisible = myUserCommunities.length > 0;

  const showLoader = loading || loadingFeaturedCommunities;

  return (
    <>
      {showToolTip && (
        <TooltipMessage
          className="my-5 mx-4-mobile mx-4-tablet-only"
          onClose={() => {
            setValue(false);
          }}
        />
      )}
      <HomeHeader hide={isUserWalletConnected} />
      {showLoader && (
        <div style={{ height: '50vh' }}>
          <Loader fullHeight />
        </div>
      )}
      {!showLoader && (
        <FadeIn>
          {isMyCommunitiesVisible && (
            <SectionContainer classNames="has-background-light-grey">
              <CommunitiesPresenter
                title="Your Dashboard"
                communities={myUserCommunities}
                hideJoin
              />
            </SectionContainer>
          )}
          <SectionContainer classNames="pt-5">
            <CommunitiesPresenter
              title="Featured Communities"
              communities={featuredCommunities}
            />
            <BrowseCommunityButton />
          </SectionContainer>
        </FadeIn>
      )}
      <HomeFooter />
    </>
  );
}
