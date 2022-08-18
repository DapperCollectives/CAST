import { useEffect, useMemo } from 'react';
import { useWebContext } from 'contexts/Web3';
import { debounce } from 'utils';
import { useQueries } from '@tanstack/react-query';
import { fetchProposalUserVotes } from 'api/proposals';
import assign from 'lodash/assign';
import { PAGINATION_INITIAL_STATE } from '../reducers';
import useCommunityProposals from './useCommunityProposals';

export default function useCommunityProposalsWithVotes({
  communityId,
  start = PAGINATION_INITIAL_STATE.start,
  count = PAGINATION_INITIAL_STATE.count,
  status,
  scrollToFetchMore = true,
} = {}) {
  const { data, isLoading, fetchNextPage, pagination, pages } =
    useCommunityProposals({
      communityId,
      start,
      count,
      status,
    });

  const {
    user: { addr },
  } = useWebContext();

  // using https://tanstack.com/query/v4/docs/guides/parallel-queries#dynamic-parallel-queries-with-usequeries
  // this enables fetching user votes per page on proposal list for a group of proposals
  const userVotesQueries = useQueries({
    enabled: pages.length > 0 && addr,
    queries: pages.map((page) => {
      const proposalIds = page.data?.map((datum) => datum.id);
      return {
        queryKey: ['user-votes', addr, proposalIds],
        queryFn: async () => {
          const userVotes = await fetchProposalUserVotes(addr, proposalIds);
          const mergedMapResults = assign(
            {},
            ...proposalIds.map((id) => ({ [id]: null })),
            ...(userVotes?.data ?? []).map(({ proposalId, choice }) => ({
              [proposalId]: choice,
            }))
          );

          return mergedMapResults;
        },
        onError: () => {
          console.error('Error while trying to fetch user votes');
        },
      };
    }),
  });

  const mergedData = useMemo(() => {
    if (data) {
      const mapVotes = assign(
        {},
        ...(userVotesQueries?.map(({ data, error }) => (error ? [] : data)) ??
          [])
      );
      const mergedData = data.map((datum) => {
        return {
          ...datum,
          // if vote is not in mapVotes:
          // - it might not be loaded yet or
          // - user is not connected
          // either case return false
          voted: Boolean(mapVotes?.[datum.id]),
        };
      });
      return mergedData;
    } else return null;
  }, [data, userVotesQueries]);

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

  return {
    data: mergedData,
    loading: isLoading,
    fetchNextPage,
    hasMore: pagination.next > 0,
  };
}
