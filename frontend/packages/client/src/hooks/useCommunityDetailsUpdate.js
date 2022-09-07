import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { useWebContext } from 'contexts/Web3';
import { UPDATE_COMMUNITY_TX } from 'const';
import { useMutation } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { updateCommunityDetailsApiReq } from 'api/community';

export default function useCommunityDetailsUpdate() {
  const { user, signMessageByWalletProvider } = useWebContext();

  const queryClient = useQueryClient();

  const { notifyError } = useErrorHandlerContext();

  const {
    mutateAsync: updateCommunityDetailsAsync,
    mutate: updateCommunityDetails,
    isLoading,
    isError,
    isSuccess,
    data,
    error,
  } = useMutation(
    async ({ communityId, updatePayload }) => {
      const timestamp = Date.now().toString();
      const hexTime = Buffer.from(timestamp).toString('hex');

      console.log(updatePayload);
      const { addr } = user;
      const [compositeSignatures, voucher] = await signMessageByWalletProvider(
        user?.services[0].uid,
        UPDATE_COMMUNITY_TX,
        hexTime
      );

      if (!compositeSignatures && !voucher) {
        throw new Error('No valid user signature found.');
      }

      return updateCommunityDetailsApiReq({
        communityId,
        updatePayload: {
          ...updatePayload,
          signingAddr: addr,
          timestamp,
          compositeSignatures,
        },
      });
    },
    {
      onSuccess: async (_, variables) => {
        const { communityId } = variables;
        await queryClient.invalidateQueries(['community-details', communityId]);
      },
      onError: (error) => {
        notifyError(error);
      },
    }
  );

  return {
    updateCommunityDetails,
    updateCommunityDetailsAsync,
    isLoading,
    isError,
    isSuccess,
    data,
    error,
  };
}
