import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { useMutation } from '@tanstack/react-query';
import {
  addUserToCommunityUserApiRep,
  deleteCommunityMemberApiReq,
} from 'api/communityUsers';

export default function useCommunityUsersMutation({ communityId } = {}) {
  const { notifyError } = useErrorHandlerContext();

  const { mutate, isLoading, isError, isSuccess, data, error } = useMutation(
    async ({ actionType, ...otherProps }) => {
      const {
        communityId,
        addr,
        hexTime,
        compositeSignatures,
        voucher,
        userType,
      } = otherProps;
      if (actionType === 'add') {
        return addUserToCommunityUserApiRep({
          communityId,
          addr,
          hexTime,
          compositeSignatures,
          voucher,
          userType,
        });
      }
      if (actionType === 'delete') {
        return deleteCommunityMemberApiReq({
          communityId,
          addr,
          hexTime,
          compositeSignatures,
          voucher,
          userType,
        });
      }
    }
  );

  const removeCommunityUsers = async ({ userType, addrs, body }) => {
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
          onSuccess: (data, error, variables, context) => {
            // Will execute only once, for the last mutation (Todo 3),
            // regardless which mutation resolves first
          },
          onError: (error) => {
            notifyError(error);
          },
        }
      );
    });
  };

  const addCommunityUsers = async ({ userType, addrs, body }) => {
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
          onSuccess: (data, error, variables, context) => {
            // Will execute only once, for the last mutation (Todo 3),
            // regardless which mutation resolves first
          },
          onError: (error) => {
            notifyError(error);
          },
        }
      );
    });
  };

  return {
    removeCommunityUsers,
    addCommunityUsers,
    isLoading,
    isError,
    isSuccess,
    data,
    error,
  };
}
