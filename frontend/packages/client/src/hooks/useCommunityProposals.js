import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { checkResponse, getPagination, getPlainData } from 'utils';
import { useInfiniteQuery } from '@tanstack/react-query';
import { PAGINATION_INITIAL_STATE } from '../reducers';

/**
 * Hook to return proposals created on a community. Results are paginated
 * @param  {int} communityId community Id to get proposals from
 * @param  {int} count page size, used for pagination limiting the number of elements returned. Defaults to 10. Max value is 25.
 * @param  {int} start indicates the start index for paginated results. Defaults to 0.
 */
export default function useCommunityProposals({
  communityId,
  start: startParam = PAGINATION_INITIAL_STATE.start,
  count: countParam = PAGINATION_INITIAL_STATE.count,
  status,
} = {}) {
  const initialPageParam = [startParam, countParam, 0, -1];

  const { notifyError } = useErrorHandlerContext();

  const queryUniqueKey = ['community-proposals', String(communityId), status];

  const { isLoading, isError, data, error, fetchNextPage } = useInfiniteQuery(
    queryUniqueKey,
    async ({ pageParam = initialPageParam, queryKey }) => {
      const [start, count] = pageParam;
      const communityId = queryKey[1];
      const url = `${
        process.env.REACT_APP_BACK_END_SERVER_API
      }/communities/${communityId}/proposals?count=${count}&start=${start}${
        status ? `&status=${status}` : ''
      }`;

      const response = await fetch(url);
      return checkResponse(response);
    },
    {
      getNextPageParam: (lastPage, pages) => {
        const { next, start, count, totalRecords } = lastPage;
        return [start + count, count, totalRecords, next];
      },
      enabled: !!communityId,
      onError: (error) => {
        notifyError(error);
      },
    }
  );

  return {
    isLoading,
    isError,
    data: getPlainData(data),
    pagination: getPagination(data, countParam),
    error,
    fetchNextPage,
    queryKey: queryUniqueKey,
  };

  // return { isLoading, isError, data, error, fetchNextPage };
  // const [state, dispatch] = useReducer(paginationReducer, {
  //   ...INITIAL_STATE,
  //   pagination: {
  //     ...PAGINATION_INITIAL_STATE,
  //     start,
  //     count,
  //   },
  // });

  // useEffect(() => {
  //   resetResults();
  // }, [status]);

  // /**
  //  * Function to fetch more results based on pagination configuration
  //  */
  // const fetchMore = useCallback(async () => {
  //   dispatch({ type: 'PROCESSING' });
  //   const url = `${
  //     process.env.REACT_APP_BACK_END_SERVER_API
  //   }/communities/${communityId}/proposals?count=${
  //     state.pagination.count
  //   }&start=${state.pagination.start}${status ? `&status=${status}` : ''}`;
  //   try {
  //     const response = await fetch(url);
  //     const proposals = await checkResponse(response);

  //     const updatedProposals = proposals.data.map((p) => ({
  //       ...p,
  //       // missing fields added to avoid breaking the frontend rendering
  //       winCount: 4480000,
  //       textDecision: 'No, do not compensate them',
  //     }));

  //     dispatch({
  //       type: 'SUCCESS',
  //       payload: { ...proposals, data: updatedProposals },
  //     });
  //   } catch (err) {
  //     notifyError(err, url);
  //     dispatch({ type: 'ERROR', payload: { errorData: err.message } });
  //   }
  // }, [state.pagination, communityId, status, notifyError]);

  // const getCommunityProposals = useCallback(async () => {
  //   dispatch({ type: 'PROCESSING' });
  //   const url = `${
  //     process.env.REACT_APP_BACK_END_SERVER_API
  //   }/communities/${communityId}/proposals?count=${count}&start=${start}${
  //     status ? `&status=${status}` : ''
  //   }`;
  //   try {
  //     const response = await fetch(url);
  //     const proposals = await checkResponse(response);

  //     const updatedProposals = (proposals.data || []).map((p) => ({
  //       ...p,
  //       // missing fields added to avoid breaking the frontend rendering
  //       winCount: 4480000,
  //       textDecision: 'No, do not compensate them',
  //     }));

  //     dispatch({
  //       type: 'SUCCESS',
  //       payload: { ...proposals, data: updatedProposals },
  //     });
  //   } catch (err) {
  //     notifyError(err, url);
  //     dispatch({ type: 'ERROR', payload: { errorData: err.message } });
  //   }
  // }, [dispatch, communityId, count, start, status, notifyError]);

  // const resetResults = () => {
  //   dispatch({ type: 'RESET_RESULTS' });
  // };

  // useEffect(() => {
  //   getCommunityProposals();
  // }, [getCommunityProposals]);

  // return {
  //   ...state,
  //   getCommunityProposals,
  //   fetchMore,
  //   resetResults,
  // };
}
