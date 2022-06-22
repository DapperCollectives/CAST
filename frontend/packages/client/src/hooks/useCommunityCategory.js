import { useReducer, useEffect, useCallback } from 'react';
import { defaultReducer, INITIAL_STATE } from '../reducers';
import { checkResponse } from '../utils';
import { useErrorHandlerContext } from '../contexts/ErrorHandler';

export default function useCommunityCategory() {
  const [state, dispatch] = useReducer(defaultReducer, INITIAL_STATE);
  const { notifyError } = useErrorHandlerContext();
  const getCommunityCategories = useCallback(async () => {
    dispatch({ type: 'PROCESSING' });
    const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/community-categories`;
    try {
      const response = await fetch(url);
      const communityCategory = await checkResponse(response);
      dispatch({
        type: 'SUCCESS',
        payload: communityCategory,
      });
    } catch (err) {
      // notify user of error
      notifyError(err, url);
      dispatch({ type: 'ERROR', payload: { errorData: err.message } });
    }
  }, [dispatch, notifyError]);

  useEffect(() => {
    getCommunityCategories();
  }, [getCommunityCategories]);

  return {
    ...state,
    getCommunityCategories,
  };
}
