import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { useWebContext } from 'contexts/Web3';
import { CAST_VOTE_TX } from 'const';
import { checkResponse } from 'utils';
import { useMutation } from '@tanstack/react-query';

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
      const hexMessage = Buffer.from(message).toString('hex');

      const [compositeSignatures, voucher] = await signMessageByWalletProvider(
        user?.services[0]?.uid,
        CAST_VOTE_TX,
        hexMessage
      );

      if (!compositeSignatures && !voucher) {
        throw new Error('No valid user signature found.');
      }

      const fetchOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...voteData,
          compositeSignatures,
          message: hexMessage,
          timestamp,
          voucher,
        }),
      };
      const { id } = proposal;
      const response = await fetch(
        `${process.env.REACT_APP_BACK_END_SERVER_API}/proposals/${id}/votes`,
        fetchOptions
      );
      return await checkResponse(response);
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
