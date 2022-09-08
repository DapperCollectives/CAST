import { useCallback } from 'react';
import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { checkResponse, getPagination, getPlainData } from 'utils';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { PAGINATION_INITIAL_STATE } from '../reducers';

/**
 * Hook to return proposal votes for a proposal. Results are paginated
 * @param  {int} count page size, used for pagination limiting the number of elements returned. Defaults to 10. Max value is 25.
 * @param  {int} start indicates the start index for paginated results. Defaults to 0.
 */

export default function useProposalVotes({
  proposalId,
  start: startParam = PAGINATION_INITIAL_STATE.start,
  count: countParam = PAGINATION_INITIAL_STATE.count,
} = {}) {
  const initialPageParam = [startParam, countParam, 0, -1];
  const { notifyError } = useErrorHandlerContext();
  const queryClient = useQueryClient();
  const { isLoading, isError, data, error, fetchNextPage } = useInfiniteQuery(
    ['proposal-votes', String(proposalId)],
    async ({ pageParam = initialPageParam, queryKey }) => {
      const [start, count] = pageParam;
      const propId = queryKey[1];
      const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/proposals/${propId}/votes?count=${count}&start=${start}`;

      const response = await fetch(url);
      return checkResponse(response);
    },
    {
      getNextPageParam: (lastPage) => {
        const { next, start, count, totalRecords } = lastPage;
        return [start + count, count, totalRecords, next];
      },
      enabled: !!proposalId,
      onError: (error) => {
        notifyError(error);
      },
    }
  );

  /**
   * Function to reset results from Api call stored in hook state
   */
  const resetResults = useCallback(async () => {
    await queryClient.resetQueries(['proposal-votes', String(proposalId)]);
  }, [queryClient, proposalId]);

  return {
    resetResults,
    isLoading,
    isError,
    data: getPlainData(data),
    error,
    pagination: getPagination(data, countParam),
    fetchNextPage,
  };
}
