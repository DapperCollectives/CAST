import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { checkResponse, getPagination, getPlainData } from 'utils';
import { useInfiniteQuery } from '@tanstack/react-query';
import { PAGINATION_INITIAL_STATE } from 'reducers';

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
      getNextPageParam: (lastPage) => {
        const { next, start, count, totalRecords } = lastPage;
        return [start + count, count, totalRecords, next];
      },
      enabled: !!addr,
      onError: (error) => {
        notifyError(error);
      },
      keepPreviousData: !!addr,
    }
  );

  return {
    isLoading,
    isError,
    data: getPlainData(data),
    error,
    pagination: getPagination(data, countParam),
    fetchNextPage,
  };
}
