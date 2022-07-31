import { useReducer, useCallback } from 'react';
import { checkResponse } from 'utils';
import { defaultReducer, INITIAL_STATE } from '../reducers';

export default function useVotesForAddress() {
  const [state, dispatch] = useReducer(defaultReducer, {
    ...INITIAL_STATE,
    loading: false,
  });

  const getVotesForAddress = useCallback(
    async (proposalIds, addr) => {
      dispatch({ type: 'PROCESSING' });
      try {
        const response = await fetch(
          `${
            process.env.REACT_APP_BACK_END_SERVER_API
          }/votes/${addr}?proposalIds=[${proposalIds.join(',')}]`
        );
        const userVotes = await checkResponse(response);

        dispatch({
          type: 'SUCCESS',
          payload: {
            [addr]: (userVotes?.data ?? []).map(({ proposalId, choice }) => ({
              [proposalId]: choice,
            })),
          },
        });
      } catch (err) {
        dispatch({ type: 'ERROR', payload: { errorData: err.message } });
      }
    },
    [dispatch]
  );

  return {
    ...state,
    getVotesForAddress,
  };
}
