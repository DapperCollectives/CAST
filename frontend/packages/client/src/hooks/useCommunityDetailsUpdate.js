import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { useWebContext } from 'contexts/Web3';
import { getCompositeSigs } from 'utils';
import { useMutation } from '@tanstack/react-query';
import { updateCommunityDetailsApiReq } from 'api/community';

export default function useCommunityDetailsUpdate() {
  const {
    user: { addr },
    injectedProvider,
  } = useWebContext();

  const { notifyError } = useErrorHandlerContext();

  const {
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
      const _compositeSignatures = await injectedProvider
        .currentUser()
        .signUserMessage(hexTime);

      const compositeSignatures = getCompositeSigs(_compositeSignatures);

      if (!compositeSignatures) {
        return { error: 'No valid user signature found.' };
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
      onError: (error) => {
        notifyError(error);
      },
    }
  );

  return {
    mutate: updateCommunityDetails,
    isLoading,
    isError,
    isSuccess,
    data,
    error,
  };
}
