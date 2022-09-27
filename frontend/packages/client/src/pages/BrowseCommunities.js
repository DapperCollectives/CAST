import { useState } from 'react';
import { Svg } from '@cast/shared-components';
import { FadeIn, FilterPill, Loader } from 'components';
import CommunitiesPresenter from 'components/Community/CommunitiesPresenter';
import { useCommunitySearch, useDebounce } from 'hooks';

const pills = [
  { text: 'All', amount: 22, selected: true },
  { text: 'DAO', amount: 3 },
  { text: 'Creator', amount: 4 },
  { text: 'NFT', amount: 8 },
  { text: 'Collector', amount: 0 },
];

export default function BrowseCommunities() {
  const [searchText, setSearchText] = useState('');

  const debounced = useDebounce(searchText, 1000);

  const {
    isLoading: isLoadingSearch,
    data: communityResult,
    fetchNextPage,
    error,
  } = useCommunitySearch({
    searchText: debounced,
  });

  console.log(communityResult);
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

      <section className="section">
        <div className="container">
          {isLoadingSearch ? (
            <FadeIn>
              <div style={{ height: '50vh' }}>
                <Loader fullHeight />
              </div>
            </FadeIn>
          ) : (
            <FadeIn>
              <CommunitiesPresenter
                titleClasses="is-size-3"
                title="Communities"
                communities={communityResult}
              />
            </FadeIn>
          )}
        </div>
      </section>
    </>
  );
}
