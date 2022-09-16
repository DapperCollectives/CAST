import { useCallback } from 'react';
import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { useMutation } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import {
  addUserToCommunityUserApiRep,
  deleteCommunityMemberApiReq,
} from 'api/communityUsers';

export default function useCommunityUsersMutation({ communityId } = {}) {
  const { notifyError } = useErrorHandlerContext();

  const queryClient = useQueryClient();

  const { mutate } = useMutation(async ({ actionType, ...otherProps }) => {
    const {
      communityId,
      addr,
      timestamp,
      compositeSignatures,
      voucher,
      signingAddr,
      userType,
    } = otherProps;

    if (actionType === 'add') {
      return addUserToCommunityUserApiRep({
        communityId,
        addr,
        timestamp,
        compositeSignatures,
        voucher,
        userType,
        signingAddr,
      });
    }
    if (actionType === 'delete') {
      return deleteCommunityMemberApiReq({
        communityId,
        addr,
        timestamp,
        compositeSignatures,
        voucher,
        userType,
        signingAddr,
      });
    }
  });

  const removeCommunityUsers = useCallback(
    async ({ userType, addrs, body }) => {
      return new Promise((resolve, reject) => {
        addrs.forEach((addrToRemove) => {
          mutate(
            {
              communityId,
              addr: addrToRemove,
              userType,
              ...body,
              actionType: 'delete',
            },
            {
              onSuccess: () => {
                // Will execute only once, for the last mutation (Todo 3),
                // regardless which mutation resolves first
                resolve();
              },
              onError: (error) => {
                notifyError(error);
                resolve();
              },
            }
          );
        });
      });
    },
    [communityId, mutate, notifyError]
  );

  const addCommunityUsers = useCallback(
    async ({ userType, addrs, body }) => {
      return new Promise((resolve, reject) => {
        addrs.forEach((addrToRemove) => {
          mutate(
            {
              communityId,
              addr: addrToRemove,
              userType,
              ...body,
              actionType: 'add',
            },
            {
              onSuccess: async () => {
                // Will execute only once, for the last mutation (Todo 3),
                // regardless which mutation resolves first
                if (userType === 'admin') {
                  // reload author list when new admins are added
                  await queryClient.invalidateQueries([
                    'community-users',
                    String(communityId),
                    'author',
                  ]);
                }
                resolve();
              },
              onError: (error) => {
                notifyError(error);
                resolve();
              },
            }
          );
        });
      });
    },
    [communityId, mutate, notifyError, queryClient]
  );

  return {
    removeCommunityUsers,
    addCommunityUsers,
  };
}
