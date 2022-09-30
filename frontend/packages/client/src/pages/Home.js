import { useEffect } from 'react';
import { useWebContext } from 'contexts/Web3';
import {
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
import classnames from 'classnames';

export default function HomePage() {
  const {
    user: { addr },
  } = useWebContext();
  const { data: communityUser, loading } = useUserCommunities({
    addr,
    count: 100,
    initialLoading: false,
  });

  const isUserWalletConnected = !!addr;

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

  const browserName = useBrowserName();
  const [showToolTip, setValue] = useLocalStorage('dw-safary-tooltip', null);

  useEffect(() => {
    const isSafari = 'Apple Safari' === browserName;
    if (isSafari && showToolTip === null) {
      setValue(true);
    }
  }, [browserName, setValue, showToolTip]);

  // if tooltips is present this will make paddin-top smaller
  const classNames = classnames('section', {
    'section-small': showToolTip,
  });

  return (
    <>
      {showToolTip && (
        <TooltipMessage
          className="my-6"
          onClose={() => {
            setValue(false);
          }}
        />
      )}
      {!isUserWalletConnected && <HomeHeader />}
      <section className={classNames}>
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
                hideJoin
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
    </>
  );
}
