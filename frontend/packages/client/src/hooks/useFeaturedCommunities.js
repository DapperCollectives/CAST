import { useErrorHandlerContext } from '../contexts/ErrorHandler';
import { checkResponse } from 'utils';
import { useInfiniteQuery } from '@tanstack/react-query';
import { PAGINATION_INITIAL_STATE } from '../reducers';

export default function useFeaturedCommunities({
  count = PAGINATION_INITIAL_STATE.count,
} = {}) {
  const { notifyError } = useErrorHandlerContext();

  const { isLoading, isError, data, error, fetchNextPage } = useInfiniteQuery(
    ['communities-for-homepage'],
    async ({ pageParam = 0 }) => {
      const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/communities-for-homepage?count=${count}&start=${pageParam}`;
      try {
        const response = await fetch(url);
        const communities = await checkResponse(response);
        return communities;
      } catch (err) {
        throw err;
      }
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
