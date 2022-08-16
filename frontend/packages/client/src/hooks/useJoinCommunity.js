import { useMutation, useQueryClient } from 'react-query';
import { useErrorHandlerContext } from '../contexts/ErrorHandler';
import { useWebContext } from 'contexts/Web3';
import { UPDATE_MEMBERSHIP_TX } from 'const';
import { getCompositeSigs } from 'utils';

export default function useJoinCommunity() {
  const queryClient = useQueryClient();
  const { notifyError } = useErrorHandlerContext();
  const { user, signMessageByWalletProvider } = useWebContext();

  const { mutateAsync: createCommunityUserMutation } = useMutation(
    async ({ communityId, user, injectedProvider }) => {
      const { addr } = user;
      const timestamp = Date.now().toString();
      const hexTime = Buffer.from(timestamp).toString('hex');
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
        const json = await response.json();
        return { success: true, data: json };
      } catch (err) {
        notifyError(err, url);
      }
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
    }
  );

  const { mutateAsync: deleteUserFromCommunityMutation } = useMutation(
    async ({ communityId, user, injectedProvider }) => {
      const { addr } = user;
      const { currentUser } = injectedProvider;
      const { signUserMessage } = currentUser();
      const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/communities/${communityId}/users/${addr}/member`;
      const timestamp = Date.now().toString();
      const hexTime = Buffer.from(timestamp).toString('hex');
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
          }),
        };

        const response = await fetch(url, fetchOptions);
        const json = await response.json();
        return { success: true, data: json };
      } catch (err) {
        notifyError(err, url);
      }
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
    }
  );

  const createCommunityUser = async (props) => {
    return createCommunityUserMutation(props);
  };

  const deleteUserFromCommunity = async (props) => {
    return deleteUserFromCommunityMutation(props);
  };

  return {
    createCommunityUser,
    deleteUserFromCommunity,
  };
}
