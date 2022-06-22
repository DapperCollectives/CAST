import { useReducer, useEffect, useCallback } from 'react';
import {
  paginationReducer,
  INITIAL_STATE,
  PAGINATION_INITIAL_STATE,
} from '../reducers';
import { checkResponse } from '../utils';
import { useErrorHandlerContext } from '../contexts/ErrorHandler';

export default function useUserCommunities({
  addr,
  count = PAGINATION_INITIAL_STATE.count,
  start = PAGINATION_INITIAL_STATE.start,
} = {}) {
  const [state, dispatch] = useReducer(paginationReducer, {
    ...INITIAL_STATE,
    pagination: {
      ...PAGINATION_INITIAL_STATE,
      count,
      start,
    },
  });
  const { notifyError } = useErrorHandlerContext();

  const resetResults = useCallback(() => {
    dispatch({ type: 'RESET_RESULTS' });
  }, []);

  const getUserCommunities = useCallback(async () => {
    dispatch({ type: 'PROCESSING' });
    const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/users/${addr}/communities?count=${count}&start=${start}`;
    try {
      const response = await fetch(url);
      const userCommunities = await checkResponse(response);
      dispatch({
        type: 'SUCCESS',
        payload: userCommunities,
      });
    } catch (err) {
      // notify user of error
      notifyError(err, url);
      dispatch({ type: 'ERROR', payload: { errorData: err.message } });
    }
  }, [dispatch, notifyError, addr, count, start]);

  useEffect(() => {
    if (addr) {
      getUserCommunities();
    }
    if (addr === null) {
      resetResults();
    }
  }, [getUserCommunities, resetResults, addr]);

  return {
    ...state,
    getUserCommunities,
    resetResults,
  };
}
