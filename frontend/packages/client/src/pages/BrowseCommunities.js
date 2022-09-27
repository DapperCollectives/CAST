import { useState } from 'react';
import { Svg } from '@cast/shared-components';
import { FadeIn, FilterPill, Loader } from 'components';
import CommunitiesPresenter from 'components/Community/CommunitiesPresenter';
import { useCommunitySearch, useDebounce, useFeaturedCommunities } from 'hooks';

// fake results to adjust presentation
const CommunityResult = [
  {
    id: 1,
    name: 'Flow 1',
    body: 'Vote on Flow Validators',
    isMember: true,
  },
  {
    id: 2,
    name: 'Flow 2',
    body: 'Vote on Flow Validators',
    isMember: false,
  },
  {
    id: 3,
    name: 'Flow 3',
    body: 'Vote on Flow Validators',
    isMember: true,
  },
];

const pills = [
  { text: 'All', amount: 22, selected: true },
  { text: 'DAO', amount: 3 },
  { text: 'Creator', amount: 4 },
  { text: 'NFT', amount: 8 },
  { text: 'Collector', amount: 0 },
];

export default function BrowseCommunities() {
  const [filters, setFilters] = useState({});
  const [searchText, setSearchText] = useState('');
  const debounced = useDebounce(searchText, 500);
  const { isLoading: loadingFeaturedCommunities, data: featuredCommunities } =
    useFeaturedCommunities();
  console.log('value debounced is ', debounced);
  const {
    isLoading: isLoadingSearch,
    data,
    fetchNextPage,
    error,
  } = useCommunitySearch({
    searchText,
  });
  console.log(data);
  console.log('isLoadingSearch', isLoadingSearch);

  const showFeatureCommunities = searchText === '';
  return (
    <>
      <div className="search-container has-background-light-grey">
        <section className="section">
          <div className="container px-1-mobile">
            <div
              className="is-flex search-input"
              style={{ position: 'relative' }}
            >
              <input
                placeholder="Search communities by name or description"
                className="border-light rounded-sm pr-3 py-3 column"
                style={{ paddingLeft: '40px' }}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignContent: 'center',
                  position: 'absolute',
                  left: 12,
                  top: 12,
                }}
              >
                <Svg name="Search" />
              </div>
            </div>
            <div
              className="is-flex is-flex-wrap-wrap mt-5"
              style={{ marginLeft: '-8px' }}
            >
              {pills.map((pill, index) => (
                <FilterPill
                  key={`pill-${index}`}
                  onClick={() => {
                    console.log('I was clicked');
                  }}
                  text={pill.text}
                  amount={pill.amount}
                  selected={pill.selected}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
      {(isLoadingSearch || loadingFeaturedCommunities) && (
        <div style={{ height: '50vh' }}>
          <Loader fullHeight />
        </div>
      )}
      <section className="section">
        <div className="container">
          {!showFeatureCommunities && (
            <FadeIn>
              <CommunitiesPresenter
                title="Communities"
                communities={CommunityResult}
              />
            </FadeIn>
          )}
          {!showFeatureCommunities && (
            <FadeIn>
              <CommunitiesPresenter
                title="Featured Communities"
                communities={featuredCommunities}
              />
            </FadeIn>
          )}
        </div>
      </section>
    </>
  );
}
