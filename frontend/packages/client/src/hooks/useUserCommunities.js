import { useInfiniteQuery } from 'react-query';
import { PAGINATION_INITIAL_STATE } from '../reducers';
import { checkResponse } from '../utils';
import { useErrorHandlerContext } from '../contexts/ErrorHandler';

export default function useUserCommunities({
  addr,
  count: countParam = PAGINATION_INITIAL_STATE.count,
} = {}) {
  const initialPageParam = [0, countParam, 0, -1];

  const { notifyError } = useErrorHandlerContext();

  const { isLoading, isError, data, error, fetchNextPage } = useInfiniteQuery(
    ['connected-user-communities', addr],
    async ({ pageParam = initialPageParam, queryKey }) => {
      const [start, count] = pageParam;
      const userAddr = queryKey[1];
      const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/users/${userAddr}/communities?count=${count}&start=${start}`;
      try {
        const response = await fetch(url);
        const communities = await checkResponse(response);
        return communities;
      } catch (err) {
        throw err;
      }
    },
    {
      getNextPageParam: (lastPage, pages) => {
        const { next, start, count, totalRecords } = lastPage;
        return [start, count, totalRecords, next];
      },
      enabled: !!addr,
    }
  );
  if (isError) {
    notifyError(error);
  }

  const [start, count, totalRecords, next] =
    data?.pageParams || initialPageParam;

  return {
    isLoading,
    isError,
    data:
      data?.pages?.reduce(
        (prev, current) =>
          current?.data ? [...prev, ...current.data] : [...prev],
        []
      ) ?? [],
    error,
    pagination: {
      count,
      next,
      start,
      totalRecords,
    },
    fetchNextPage,
  };
}
