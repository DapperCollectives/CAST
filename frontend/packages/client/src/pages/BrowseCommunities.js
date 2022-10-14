import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Svg } from '@cast/shared-components';
import { FadeIn, FilterPill, Loader } from 'components';
import CommunitiesPresenter from 'components/Community/CommunitiesPresenter';
import { useCommunitySearch, useDebounce, useQueryParams } from 'hooks';
import SectionContainer from 'layout/SectionContainer';

const updateText = (text, isDefaultSearch) => {
  if (text === 'all' && isDefaultSearch) {
    return 'Featured';
  }
  if (text === 'dao') {
    return 'DAO';
  }
  if (text === 'nft') {
    return 'NFT';
  }

  return text.charAt(0).toUpperCase() + text.substring(1, text.length);
};
export default function BrowseCommunities() {
  const history = useHistory();

  const {
    location: { search: routerSearch },
  } = history;

  const { text: search, filters: filtersUrl } = useQueryParams({
    text: 'text',
    filters: 'filters',
  });

  const [searchText, setSearchText] = useState(search ? search : '');

  const [pills, setPills] = useState([]);

  const [selectedPills, setSelectedPills] = useState(
    filtersUrl ? filtersUrl.split(',') : ['all']
  );

  const debouncedSearchText = useDebounce(searchText, 1000);

  const searchTextParam = debouncedSearchText;

  // this effect handles browser URL writing
  useEffect(() => {
    const queryUrlParams = new URLSearchParams({
      ...(searchTextParam ? { text: searchTextParam } : undefined),
      ...(selectedPills.includes('all')
        ? undefined
        : { filters: selectedPills }),
    }).toString();
    // update url browser with search and filters to it is keep for navigation back and forth
    if (routerSearch !== searchTextParam) {
      history.replace(`/browse-communities?${queryUrlParams}`);
    }
  }, [routerSearch, searchTextParam, filtersUrl, history, selectedPills]);

  const {
    isLoading: isLoadingSearch,
    isFetchingNextPage,
    data: communityResult,
    error,
  } = useCommunitySearch({
    searchText: searchTextParam,
    // do not send filters when all is selected
    ...(selectedPills.includes('all') ? undefined : { filters: selectedPills }),
  });

  const { filters, results: communitiesResult = [] } = communityResult;

  // first load
  useEffect(() => {
    if (filters?.length !== 0) {
      // sort pills
      filters.sort((a, b) => (a.text > b.text ? 1 : -1));
      setPills(filters);
    }
  }, [filters, error]);

  const addOrRemovePillFilter = (val) => {
    const value = val.toLowerCase();
    if (value === 'all' || value === 'featured') {
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
                placeholder="Search communities by name"
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
            <FadeIn>
              <div
                className="is-flex is-flex-wrap-wrap mt-5"
                style={{ marginLeft: '-8px' }}
              >
                {pills.length > 0 &&
                  pills.map((pill, index) => (
                    <FilterPill
                      key={`pill-${index}`}
                      onClick={addOrRemovePillFilter}
                      text={updateText(pill.text, searchTextParam === '')}
                      amount={pill.amount}
                      selected={selectedPills.includes(
                        pill.text?.toLowerCase()
                      )}
                    />
                  ))}
              </div>
            </FadeIn>
          </div>
        </section>
      </div>

      <SectionContainer>
        {isLoadingSearch && !communitiesResult ? (
          <FadeIn>
            <div style={{ height: '50vh' }}>
              <Loader fullHeight />
            </div>
          </FadeIn>
        ) : (
          <>
            <FadeIn>
              {communitiesResult?.length > 0 ? (
                <CommunitiesPresenter
                  titleClasses="is-size-3"
                  title="Communities"
                  communities={communitiesResult}
                />
              ) : (
                <p className="is-size-3 has-text-weight-bold p-3-mobile">
                  No communities were found.
                </p>
              )}
            </FadeIn>
            {isFetchingNextPage && communitiesResult?.length > 0 && (
              <div className="mt-6">
                <Loader size={18} fullHeight />
              </div>
            )}
          </>
        )}
      </SectionContainer>
    </>
  );
}
