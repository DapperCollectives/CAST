import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { useQuery } from '@tanstack/react-query';
import { fetchProposal } from 'api/proposals';

export default function useProposal({ proposalId } = {}) {
  const { notifyError } = useErrorHandlerContext();

  const { isLoading, isError, data, error } = useQuery(
    ['proposal', String(proposalId)],
    async () => {
      return fetchProposal({ proposalId });
    },
    {
      enabled: !!proposalId,
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
