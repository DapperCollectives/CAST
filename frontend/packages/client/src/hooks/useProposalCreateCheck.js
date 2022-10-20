import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { useQuery } from '@tanstack/react-query';
import { checkCanUserCreateProposal } from 'api/proposals';

export default function useProposalCreateCheck({ communityId, addr } = {}) {
  const { notifyError } = useErrorHandlerContext();

  const { isLoading, isError, data, error } = useQuery(
    ['check-user-can-create-proposal', String(communityId), addr],
    async () => {
      return checkCanUserCreateProposal({ communityId, addr });
    },
    {
      enabled: !!(communityId && addr),
      onError: (error) => {
        notifyError(error);
      },
    }
  );

  return {
    isLoading,
    isError,
    data,
    error,
  };
}
