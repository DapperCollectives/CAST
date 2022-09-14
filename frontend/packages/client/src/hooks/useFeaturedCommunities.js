import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchCommunitiesForHomePage } from 'api/community';
import { PAGINATION_INITIAL_STATE } from 'reducers';

export default function useFeaturedCommunities({
  count = PAGINATION_INITIAL_STATE.count,
} = {}) {
  const { notifyError } = useErrorHandlerContext();

  const { isLoading, isError, data, error, fetchNextPage } = useInfiniteQuery(
    ['communities-for-homepage'],
    async ({ pageParam = 0 }) => {
      return fetchCommunitiesForHomePage({ count, start: pageParam });
    },
    {
      getNextPageParam: (lastPage) => {
        const { next, start, count } = lastPage;
        return next > 0 ? start + count : undefined;
      },
    }
  );
  if (isError) {
    notifyError(error);
  }
  return {
    isLoading,
    isError,
    data: data?.pages?.reduce(
      (prev, current) => (current.data ? [...prev, ...current.data] : prev),
      []
    ),
    pages: data?.pages ?? [],
    error,
    fetchNextPage,
  };
}
