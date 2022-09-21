import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { useWebContext } from 'contexts/Web3';
import { UPDATE_PROPOSAL_TX } from 'const';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProposalApiReq } from 'api/proposals';

export default function useProposalMutation() {
  const { notifyError } = useErrorHandlerContext();
  const { user, signMessageByWalletProvider } = useWebContext();

  const queryClient = useQueryClient();

  const {
    mutateAsync: updateProposal,
    isLoading,
    isError,
    isSuccess,
    data,
    error,
  } = useMutation(
    async ({ communityId, id: proposalId, updatePayload }) => {
      const timestamp = Date.now().toString();

      const [compositeSignatures, voucher] = await signMessageByWalletProvider(
        user?.services[0]?.uid,
        UPDATE_PROPOSAL_TX,
        timestamp
      );

      if (!compositeSignatures && !voucher) {
        throw new Error('No valid user signature found.');
      }

      return updateProposalApiReq({
        communityId,
        proposalId,
        updatePayload,
        timestamp,
        compositeSignatures,
        voucher,
      });
    },
    {
      onSuccess: async (result, variables, context) => {
        // set new proposal created on local cache
        await queryClient.setQueryData(['proposal', String(result.id)], result);
      },
      onError: (error) => {
        notifyError(error);
      },
    }
  );

  return { isLoading, isError, isSuccess, data, error, updateProposal };
}
