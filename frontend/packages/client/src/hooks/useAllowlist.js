import { useCallback, useEffect, useReducer } from 'react';
import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { checkResponse } from 'utils';
import { INITIAL_STATE, defaultReducer } from '../reducers';

export default function useAllowlist() {
  const [state, dispatch] = useReducer(defaultReducer, INITIAL_STATE);
  const { notifyError } = useErrorHandlerContext();

  const getAllowlist = useCallback(async () => {
    dispatch({ type: 'PROCESSING' });
    const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/accounts/admin`;
    try {
      const response = await fetch(url);
      const allowList = await checkResponse(response);
      dispatch({ type: 'SUCCESS', payload: allowList ?? [] });
    } catch (err) {
      // notify user of error
      notifyError(err, url);
      dispatch({ type: 'ERROR', payload: { errorData: err.message } });
    }
  }, [dispatch, notifyError]);

  useEffect(() => {
    getAllowlist();
  }, [getAllowlist]);

  return {
    ...state,
    getAllowlist,
  };
}
