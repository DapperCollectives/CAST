import { useReducer, useEffect, useCallback } from 'react';
import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { checkResponse } from 'utils';
import { defaultReducer, INITIAL_STATE } from '../reducers';

export default function useVotingStrategies() {
  const [state, dispatch] = useReducer(defaultReducer, INITIAL_STATE);
  const { notifyError } = useErrorHandlerContext();
  const getVotingStrategies = useCallback(async () => {
    dispatch({ type: 'PROCESSING' });
    const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/voting-strategies`;
    try {
      const response = await fetch(url);
      const strategies = await checkResponse(response);
      dispatch({ type: 'SUCCESS', payload: strategies });
    } catch (err) {
      notifyError(err, url);
      dispatch({ type: 'ERROR', payload: { errorData: err.message } });
    }
  }, [dispatch, notifyError]);

  useEffect(() => {
    getVotingStrategies();
  }, [getVotingStrategies]);

  return {
    ...state,
    getVotingStrategies,
  };
}
