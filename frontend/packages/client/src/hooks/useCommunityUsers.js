import { useReducer, useEffect, useCallback } from 'react';
import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { checkResponse } from 'utils';
import {
  paginationReducer,
  PAGINATION_INITIAL_STATE,
  INITIAL_STATE,
} from '../reducers';
/**
 * Hook to return users from a community. Results are paginated
 * @param  {int} communityId community Id to get proposals from
 * @param  {int} count page size, used for pagination limiting the number of elements returned. Defaults to 10. Max value is 25.
 * @param  {int} start indicates the start index for paginated results. Defaults to 0.
 * @param  {int} type optional filter that enables filter user type on fetch .
 */
export default function useCommunityUsers({
  communityId,
  start = PAGINATION_INITIAL_STATE.start,
  count = PAGINATION_INITIAL_STATE.count,
  type,
} = {}) {
  const [state, dispatch] = useReducer(paginationReducer, {
    ...INITIAL_STATE,
    pagination: {
      ...PAGINATION_INITIAL_STATE,
      start,
      count,
    },
  });

  useEffect(() => {
    resetResults();
  }, [type]);

  const { notifyError } = useErrorHandlerContext();
  /**
   * Function to fetch more results based on pagination configuration
   */
  const fetchMore = useCallback(async () => {
    dispatch({ type: 'PROCESSING' });
    const url = `${
      process.env.REACT_APP_BACK_END_SERVER_API
    }/communities/${communityId}/users${type ? `/type/${type}` : ''}?count=${
      state.pagination.start
    }&start=${state.pagination.start}`;
    try {
      const response = await fetch(url);
      const users = await checkResponse(response);

      dispatch({
        type: 'SUCCESS',
        payload: users,
      });
    } catch (err) {
      notifyError(err, url);
      dispatch({ type: 'ERROR', payload: { errorData: err.message } });
    }
  }, [state.pagination, communityId, type, notifyError]);

  const getCommunityUsers = useCallback(async () => {
    dispatch({ type: 'PROCESSING' });
    const url = `${
      process.env.REACT_APP_BACK_END_SERVER_API
    }/communities/${communityId}/users${
      type ? `/type/${type}` : ''
    }?count=${count}&start=${start}`;
    try {
      const response = await fetch(url);
      const users = await checkResponse(response);
      dispatch({
        type: 'SUCCESS',
        payload: users,
      });
    } catch (err) {
      notifyError(err, url);
      dispatch({ type: 'ERROR', payload: { errorData: err.message } });
    }
  }, [dispatch, communityId, count, start, type, notifyError]);

  const removeCommunityUsers = useCallback(
    async ({ type: userType, addrs, body }) => {
      const requests = addrs.map((addrToRemove) => {
        const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/communities/${communityId}/users/${addrToRemove}/${userType}`;
        const fetchOptions = {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        };
        return fetch(url, fetchOptions);
      });

      const responses = await Promise.all(requests);
      await Promise.all(responses.map((response) => checkResponse(response)));
    },
    [communityId]
  );

  const addCommunityUsers = useCallback(
    async ({ type: userType, addrs, body }) => {
      const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/communities/${communityId}/users`;

      const requests = addrs.map((addrToAdd) => {
        const fetchOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...body,
            addr: addrToAdd,
            userType,
          }),
        };
        return fetch(url, fetchOptions);
      });
      const responses = await Promise.all(requests);

      await Promise.all(responses.map((response) => checkResponse(response)));
    },
    [communityId]
  );

  const resetResults = () => {
    dispatch({ type: 'RESET_RESULTS' });
  };

  // clears all results and pulls again
  const reFetch = async () => {
    resetResults();
    await getCommunityUsers();
  };

  useEffect(() => {
    getCommunityUsers();
  }, [getCommunityUsers]);

  return {
    ...state,
    removeCommunityUsers,
    addCommunityUsers,
    getCommunityUsers,
    fetchMore,
    resetResults,
    reFetch,
  };
}
