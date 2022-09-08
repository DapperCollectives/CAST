import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { useWebContext } from 'contexts/Web3';
import { CREATE_PROPOSAL_TX } from 'const';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProposalApiReq } from 'api/proposals';

export default function useProposalCreateMuation() {
  const { notifyError } = useErrorHandlerContext();
  const { user, signMessageByWalletProvider } = useWebContext();
  const queryClient = useQueryClient();

  const {
    mutate: createProposal,
    isLoading,
    isError,
    isSuccess,
    data,
    error,
  } = useMutation(
    async (proposalPayload) => {
      const hexTime = Buffer.from(Date.now().toString()).toString('hex');
      const [compositeSignatures, voucher] = await signMessageByWalletProvider(
        user?.services[0]?.uid,
        CREATE_PROPOSAL_TX,
        hexTime
      );

      if (!compositeSignatures && !voucher) {
        throw new Error('No valid user signature found.');
      }

      return createProposalApiReq({
        proposalPayload,
        compositeSignatures,
        voucher,
        hexTime,
      });
    },
    {
      onSuccess: async (result, variables, context) => {
        // set new proposal created on local cache
        await queryClient.setQueryData(['proposal', String(result.id)], result);
      },
      onError: (error) => {
        notifyError({
          status: 'Something went wrong with your proposal.',
          statusText: error.message,
        });
      },
    }
  );

  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    createProposal,
  };
}
