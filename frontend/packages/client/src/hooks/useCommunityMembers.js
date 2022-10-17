import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { checkResponse, getPagination, getPlainData } from 'utils';
import { useInfiniteQuery } from '@tanstack/react-query';
import { PAGINATION_INITIAL_STATE } from 'reducers';

export default function useCommunityMembers({
  communityId,
  count: countParam = PAGINATION_INITIAL_STATE.count,
} = {}) {
  const initialPageParam = [0, countParam, 0, -1];

  const { notifyError } = useErrorHandlerContext();

  const queryUniqueKey = ['all-community-users', String(communityId)];

  const { isLoading, isError, data, error, fetchNextPage } = useInfiniteQuery(
    queryUniqueKey,
    async ({ pageParam = initialPageParam, queryKey }) => {
      const [start, count] = pageParam;
      const communityId = queryKey[1];
      const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/communities/${communityId}/users?count=${count}&start=${start}`;
      try {
        const response = await fetch(url);
        return checkResponse(response);
      } catch (err) {
        throw err;
      }
    },
    {
      getNextPageParam: (lastPage) => {
        const { next, start, count, totalRecords } = lastPage;
        return [start + count, count, totalRecords, next];
      },
      enabled: !!communityId,
      onError: (error) => {
        notifyError(error);
      },
      keepPreviousData: true,
    }
  );

  return {
    isLoading,
    isError,
    data: getPlainData(data),
    error,
    pagination: getPagination(data, countParam),
    fetchNextPage,
    queryKey: queryUniqueKey,
  };
}
