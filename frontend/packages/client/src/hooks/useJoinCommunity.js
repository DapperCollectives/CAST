import { useErrorHandlerContext } from '../contexts/ErrorHandler';
import { getCompositeSigs } from 'utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function useJoinCommunity() {
  const queryClient = useQueryClient();
  const { notifyError } = useErrorHandlerContext();

  const { mutateAsync: createCommunityUserMutation } = useMutation(
    async ({ communityId, user, injectedProvider }) => {
      const { addr } = user;
      const { currentUser } = injectedProvider;
      const { signUserMessage } = currentUser();
      const timestamp = Date.now().toString();
      const hexTime = Buffer.from(timestamp).toString('hex');
      const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/communities/${communityId}/users`;
      const _compositeSignatures = await signUserMessage(hexTime);
      if (_compositeSignatures.indexOf('Declined:') > -1) {
        return { success: false };
      }
      const compositeSignatures = getCompositeSigs(_compositeSignatures);
      if (!compositeSignatures) {
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
            timestamp,
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

  const { mutateAsync: deleteUserFromCommunityMutation } = useMutation(
    async ({ communityId, user, injectedProvider }) => {
      const { addr } = user;
      const { currentUser } = injectedProvider;
      const { signUserMessage } = currentUser();
      const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/communities/${communityId}/users/${addr}/member`;
      const timestamp = Date.now().toString();
      const hexTime = Buffer.from(timestamp).toString('hex');
      const _compositeSignatures = await signUserMessage(hexTime);
      if (_compositeSignatures.indexOf('Declined:') > -1) {
        return { success: false };
      }
      const compositeSignatures = getCompositeSigs(_compositeSignatures);
      if (!compositeSignatures) {
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
            timestamp,
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
