import { useEffect, useMemo } from 'react';
import { useWebContext } from 'contexts/Web3';
import { debounce } from 'utils';
import { PAGINATION_INITIAL_STATE } from '../reducers';
import useCommunityProposals from './useCommunityProposals';
import useVotesForAddress from './useVotesForAddress';

export default function useCommunityProposalsWithVotes({
  communityId,
  start = PAGINATION_INITIAL_STATE.start,
  count = PAGINATION_INITIAL_STATE.count,
  status,
  scrollToFetchMore = true,
} = {}) {
  const { data, isLoading, fetchNextPage, pagination } = useCommunityProposals({
    communityId,
    start,
    count,
    status,
  });

  console.log(data);
  const {
    user: { addr },
  } = useWebContext();
  const {
    getVotesForAddress,
    data: votesForAddressData,
    loading: isLoadingVotes,
  } = useVotesForAddress();
  const votesFromAddress = votesForAddressData?.[addr];

  // useEffect(() => {
  //   async function getVotes() {
  //     // get only if voted for the ones that are not completed
  //     getVotesForAddress(
  //       data
  //         .filter((datum) => datum.voted === undefined)
  //         .map((datum) => datum.id),
  //       addr
  //     );
  //   }
  //   if (addr && !isLoading && Array.isArray(data) && !isLoadingVotes) {
  //     getVotes();
  //   }
  // }, [addr, data, isLoading, getVotesForAddress, isLoadingVotes]);

  const hasMore = pagination.next > 0;

  useEffect(() => {
    if (scrollToFetchMore) {
      document.hasMore = hasMore;
      document.loadingProposals = isLoading;
      document.fetchNextPage = fetchNextPage;
    }
  }, [hasMore, isLoading, fetchNextPage, scrollToFetchMore]);

  function pullDataFromApi() {
    return debounce(() => {
      if (
        document.documentElement.scrollHeight <=
        window.pageYOffset + window.innerHeight
      ) {
        if (document.hasMore && !document.loadingProposals) {
          document.fetchNextPage();
        }
      }
    }, 500);
  }

  useEffect(() => {
    if (scrollToFetchMore) {
      document.addEventListener('scroll', pullDataFromApi());
    }
    return () =>
      scrollToFetchMore &&
      document.removeEventListener('scroll', pullDataFromApi());
  }, [scrollToFetchMore]);

  // merges user votes with list of proposals
  const mergedData = useMemo(() => {
    if (data && addr !== null) {
      const mapVotes = Object.assign({}, ...(votesFromAddress || []));
      return data.map((datum) => {
        return {
          ...datum,
          voted: datum.voted === undefined ? !!mapVotes[datum.id] : false,
        };
      });
      // user is not logged in
    } else if (data && addr === null) {
      return data.map((datum) => {
        return {
          ...datum,
          voted: false,
        };
      });
    } else return null;
  }, [votesFromAddress, data, addr]);

  return {
    data: mergedData,
    loading: isLoading,
    fetchNextPage,
    hasMore: pagination.next > 0,
  };
}
