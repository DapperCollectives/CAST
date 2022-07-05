import { useReducer, useCallback } from 'react';
import {
  paginationReducer,
  PAGINATION_INITIAL_STATE,
  INITIAL_STATE,
} from '../reducers';
import { checkResponse } from 'utils';
import { useErrorHandlerContext } from '../contexts/ErrorHandler';

export default function useFeaturedCommunities({
  start = PAGINATION_INITIAL_STATE.start,
  count = PAGINATION_INITIAL_STATE.count,
} = {}) {
  const [state, dispatch] = useReducer(paginationReducer, {
    ...INITIAL_STATE,
    pagination: {
      ...PAGINATION_INITIAL_STATE,
      start,
      count,
    },
  });
  const { notifyError } = useErrorHandlerContext();

  const getFeaturedCommunities = useCallback(async () => {
    dispatch({ type: 'PROCESSING' });
    const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/communities-for-homepage?count=${count}&start=${start}`;
    try {
      const response = await fetch(url);
      const communities = await checkResponse(response);
      dispatch({
        type: 'SUCCESS',
        payload: communities ?? [],
      });
    } catch (err) {
      // notify user of error
      notifyError(err, url);
      dispatch({ type: 'ERROR', payload: { errorData: err.message } });
    }
  }, [dispatch, notifyError, count, start]);

  const fetchMore = useCallback(async () => {
    dispatch({ type: 'PROCESSING' });
    const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/communities-for-homepage?count=${state.pagination.count}&start=${state.pagination.start}`;
    try {
      const response = await fetch(url);
      const communities = await checkResponse(response);

      dispatch({
        type: 'SUCCESS',
        payload: communities,
      });
    } catch (err) {
      notifyError(err, url);
      dispatch({ type: 'ERROR', payload: { errorData: err.message } });
    }
  }, [state.pagination, notifyError]);
  return {
    ...state,
    getFeaturedCommunities,
    fetchMore,
  };
}
