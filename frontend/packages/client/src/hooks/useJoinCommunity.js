import { useErrorHandlerContext } from '../contexts/ErrorHandler';
import { checkResponse, useWebContext } from 'contexts/Web3';
import { UPDATE_MEMBERSHIP_TX } from 'const';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function useJoinCommunity() {
  const queryClient = useQueryClient();
  const { notifyError } = useErrorHandlerContext();
  const { signMessageByWalletProvider } = useWebContext();

  const { mutate: createCommunityUserMutation } = useMutation(
    async ({ communityId, user, injectedProvider }) => {
      const { addr } = user;
      const hexTime = Buffer.from(Date.now().toString()).toString('hex');
      const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/communities/${communityId}/users`;
      const [compositeSignatures, voucher] = await signMessageByWalletProvider(
        user?.services[0].uid,
        UPDATE_MEMBERSHIP_TX,
        hexTime
      );

      if (!compositeSignatures && !voucher) {
        return { error: 'No valid user signature found.' };
      }

      try {
        const fetchOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            communityId: parseInt(communityId),
            addr,
            userType: 'member',
            signingAddr: addr,
            timestamp: hexTime,
            compositeSignatures,
            voucher,
          }),
        };

      const response = await fetch(url, fetchOptions);
      return checkResponse(response);
    },
    {
      onSuccess: async (_, variables) => {
        const {
          user: { addr },
        } = variables;

        await queryClient.invalidateQueries('communities-for-homepage');
        await queryClient.invalidateQueries([
          'connected-user-communities',
          addr,
        ]);
      },
      onError: (error) => {
        notifyError(error);
      },
    }
  );

  const { mutate: deleteUserFromCommunityMutation } = useMutation(
    async ({ communityId, user, injectedProvider }) => {
      const { addr } = user;
      const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/communities/${communityId}/users/${addr}/member`;
      const hexTime = Buffer.from(Date.now().toString()).toString('hex');
      const [compositeSignatures, voucher] = await signMessageByWalletProvider(
        user?.services[0].uid,
        UPDATE_MEMBERSHIP_TX,
        hexTime
      );
      if (!compositeSignatures && !voucher) {
        return { error: 'No valid user signature found.' };
      }

      try {
        const fetchOptions = {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            communityId: parseInt(communityId),
            addr,
            userType: 'member',
            signingAddr: addr,
            timestamp: hexTime,
            compositeSignatures,
            voucher,
          }),
        };

      const response = await fetch(url, fetchOptions);
      return checkResponse(response);
    },
    {
      onSuccess: async (_, variables) => {
        const {
          user: { addr },
        } = variables;

        await queryClient.invalidateQueries('communities-for-homepage');
        await queryClient.invalidateQueries([
          'connected-user-communities',
          addr,
        ]);
      },
      onError: (error) => {
        notifyError(error);
      },
    }
  );

  return {
    createCommunityUser: createCommunityUserMutation,
    deleteUserFromCommunity: deleteUserFromCommunityMutation,
  };
}
