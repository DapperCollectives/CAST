import { useReducer, useEffect, useCallback } from 'react';
import { defaultReducer, INITIAL_STATE } from '../reducers';
import { checkResponse } from '../utils';
import { useErrorHandlerContext } from '../contexts/ErrorHandler';

export default function useVotingStrategies() {
  const [state, dispatch] = useReducer(defaultReducer, INITIAL_STATE);
  const { notifyError } = useErrorHandlerContext();
  const getVotingStrategies = useCallback(async () => {
    dispatch({ type: 'PROCESSING' });
    const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/voting-strategies`;
    try {
      const response = await fetch(url);
      let strategies = await checkResponse(response);
      // If nft/ft strategies exist for one-address-one-vote, remove one-address-one-vote as an option as it is deprecated
      if (
        strategies.filter(
          (strategy) =>
            strategy.key === 'one-address-one-vote-nft' ||
            strategy.key === 'one-address-one-vote-ft'
        ).length === 2
      ) {
        strategies = strategies.filter(
          (strategy) => strategy.key !== 'one-address-one-vote'
        );
      }
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
