import { useCallback, useReducer } from 'react';
import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { useWebContext } from 'contexts/Web3';
import { UPDATE_PROPOSAL_TX } from 'const';
import { checkResponse } from 'utils';
import { INITIAL_STATE, defaultReducer } from '../reducers';

export default function useProposalMutation() {
  const [state, dispatch] = useReducer(defaultReducer, {
    ...INITIAL_STATE,
    loading: false,
  });
  const { notifyError } = useErrorHandlerContext();
  const { user, signMessageByWalletProvider } = useWebContext();

  const updateProposal = useCallback(
    async (injectedProvider, proposalData, update) => {
      const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/communities/${proposalData.communityId}/proposals/${proposalData.id}`;
      try {
        const hexTime = Buffer.from(Date.now().toString()).toString('hex');

        const [compositeSignatures, voucher] =
          await signMessageByWalletProvider(
            user?.services[0]?.uid,
            UPDATE_PROPOSAL_TX,
            hexTime
          );

        if (!compositeSignatures && !voucher) {
          return { error: 'No valid user signature found.' };
        }

        const fetchOptions = {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...update,
            timestamp: hexTime,
            compositeSignatures,
            voucher,
          }),
        };
        dispatch({ type: 'PROCESSING' });
        const response = await fetch(url, fetchOptions);
        const json = await checkResponse(response);

        const sortedProposalChoices =
          json?.choices?.sort((a, b) =>
            a.choiceText > b.choiceText ? 1 : -1
          ) ?? [];

        const updatedResponse = {
          ...json,
          choices: sortedProposalChoices.map((choice) => ({
            label: choice.choiceText,
            value: choice.choiceText,
            choiceImgUrl: choice.choiceImgUrl,
          })),
        };

        dispatch({ type: 'SUCCESS', payload: updatedResponse });

        return updatedResponse;
      } catch (err) {
        notifyError(err, url);
        dispatch({ type: 'ERROR', payload: { errorData: err.message } });
        return { error: err.message };
      }
    },
    [dispatch, notifyError, signMessageByWalletProvider, user?.services]
  );
  return {
    ...state,
    updateProposal,
  };
}