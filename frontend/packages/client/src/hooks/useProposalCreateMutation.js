import { useCallback, useReducer } from 'react';
import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { useWebContext } from 'contexts/Web3';
import { CREATE_PROPOSAL_TX } from 'const';
import { checkResponse } from 'utils';
import { INITIAL_STATE, defaultReducer } from '../reducers';

export default function useProposalCreateMuation() {
  const [state, dispatch] = useReducer(defaultReducer, {
    ...INITIAL_STATE,
    loading: false,
  });
  const { notifyError } = useErrorHandlerContext();
  const { user, signMessageByWalletProvider } = useWebContext();

  const createProposal = useCallback(
    async (data) => {
      dispatch({ type: 'PROCESSING' });
      const { communityId, ...proposalData } = data;
      const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/communities/${communityId}/proposals`;
      try {
        const hexTime = Buffer.from(Date.now().toString()).toString('hex');
        const [compositeSignatures, voucher] =
          await signMessageByWalletProvider(
            user?.services[0]?.uid,
            CREATE_PROPOSAL_TX,
            hexTime
          );

        if (!compositeSignatures && !voucher) {
          const statusText = 'No valid user signature found.';
          // modal error will open
          notifyError(
            { status: 'Something went wrong with your proposal.', statusText },
            url
          );
          dispatch({
            type: 'ERROR',
            payload: { errorData: statusText },
          });
          return;
        }

        const fetchOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...proposalData,
            timestamp: hexTime,
            compositeSignatures,
            voucher,
          }),
        };

        const response = await fetch(url, fetchOptions);
        const json = await checkResponse(response);
        dispatch({ type: 'SUCCESS', payload: json });
      } catch (err) {
        notifyError(err, url, 'Something went wrong with your proposal.');
        dispatch({ type: 'ERROR', payload: { errorData: err.message } });
      }
    },
    [dispatch, notifyError, signMessageByWalletProvider, user?.services]
  );
  return {
    ...state,
    createProposal,
  };
}
