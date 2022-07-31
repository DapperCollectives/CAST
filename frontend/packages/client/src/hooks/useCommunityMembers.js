import { useInfiniteQuery } from 'react-query';
import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { checkResponse, getPaginationInfo } from 'utils';
import { PAGINATION_INITIAL_STATE } from '../reducers';

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
        const members = await checkResponse(response);
        return members;
      } catch (err) {
        throw err;
      }
    },
    {
      getNextPageParam: (lastPage, pages) => {
        const { next, start, count, totalRecords } = lastPage;
        return [start + count, count, totalRecords, next];
      },
      enabled: !!communityId,
    }
  );
  if (isError) {
    notifyError(error);
  }

  const [start = 0, count = countParam, totalRecords = 0, next = -1] =
    data?.pageParam ?? getPaginationInfo(data?.pages);

  return {
    isLoading,
    isError,
    data: data?.pages?.reduce(
      (prev, current) => (current.data ? [...prev, ...current.data] : prev),
      []
    ),
    error,
    pagination: {
      count,
      next,
      start,
      totalRecords,
    },
    fetchNextPage,
    queryKey: queryUniqueKey,
  };
}
