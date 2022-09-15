import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { useWebContext } from 'contexts/Web3';
import { CAST_VOTE_TX } from 'const';
import { useMutation } from '@tanstack/react-query';
import { voteOnProposalApiReq } from 'api/proposals';

export default function useVoteOnProposal() {
  const { notifyError } = useErrorHandlerContext();
  const { user, signMessageByWalletProvider } = useWebContext();

  const {
    mutateAsync: voteOnProposal,
    isLoading,
    isError,
    isSuccess,
    data,
    error,
  } = useMutation(
    async ({ proposal, voteData }) => {
      const timestamp = Date.now();
      const hexChoice = Buffer.from(voteData.choice).toString('hex');
      const message = `${proposal.id}:${hexChoice}:${timestamp}`;

      const [compositeSignatures, voucher] = await signMessageByWalletProvider(
        user?.services[0]?.uid,
        CAST_VOTE_TX,
        message
      );

      if (!compositeSignatures && !voucher) {
        throw new Error('No valid user signature found.');
      }

      return voteOnProposalApiReq({
        voteData,
        message,
        timestamp,
        compositeSignatures,
        voucher,
        proposalId: proposal.id,
      });
    },
    {
      onError: (error) => {
        notifyError(error);
      },
    }
  );

  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    voteOnProposal,
  };
}
