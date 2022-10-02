import { useEffect, useState } from 'react';
import { Svg } from '@cast/shared-components';
import { FadeIn, FilterPill, Loader } from 'components';
import CommunitiesPresenter from 'components/Community/CommunitiesPresenter';
import { useCommunitySearch, useDebounce } from 'hooks';

export default function BrowseCommunities() {
  const [searchText, setSearchText] = useState('');
  const [pills, setPills] = useState([]);
  const [selectedPills, setSelectedPills] = useState(['all']);

  const debounced = useDebounce(searchText, 1000);

  const {
    isLoading: isLoadingSearch,
    isFetchingNextPage,
    data: communityResult,
  } = useCommunitySearch({
    // NOTE:
    // Backend returns feature communities when search text is "defaultFeatured"
    // this is why on empty search text we use feature communities
    searchText: debounced === '' ? 'defaultFeatured' : debounced,
    // do not send filtes when all is selected
    ...(selectedPills.includes('all') ? undefined : { filters: selectedPills }),
  });

  const { filters, results: communitiesResult } = communityResult;

  // first load
  useEffect(() => {
    setPills(filters);
  }, [filters]);

  const addOrRemovePillFilter = (val) => {
    const value = val.toLowerCase();
    if (value === 'all') {
      setSelectedPills(['all']);
      return;
    }
    // using sort to the query can be cached by react-query faster
    // remove if it's included
    if (selectedPills.includes(value)) {
      const newValues = selectedPills.filter((el) => el !== value).sort();
      // if after removing none is there set all again
      setSelectedPills(newValues.length === 0 ? ['all'] : newValues);
      return;
    }
    // add
    setSelectedPills((prev) =>
      [...prev.filter((val) => val !== 'all'), value].sort()
    );
  };

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
              {pills.length > 0 && (
                <FadeIn>
                  {pills.map((pill, index) => (
                    <FilterPill
                      key={`pill-${index}`}
                      onClick={addOrRemovePillFilter}
                      text={pill.text}
                      amount={pill.amount}
                      selected={selectedPills.includes(
                        pill.text?.toLowerCase()
                      )}
                    />
                  ))}
                </FadeIn>
              )}
            </div>
          </div>
        </section>
      </div>

      <section className="section">
        <div className="container">
          {isLoadingSearch && !communitiesResult ? (
            <FadeIn>
              <div style={{ height: '50vh' }}>
                <Loader fullHeight />
              </div>
            </FadeIn>
          ) : (
            <>
              <FadeIn>
                <CommunitiesPresenter
                  titleClasses="is-size-3"
                  title="Communities"
                  communities={communitiesResult}
                />
              </FadeIn>
              {isFetchingNextPage && communitiesResult?.length > 0 && (
                <div className="mt-6">
                  <Loader size={18} fullHeight />
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
