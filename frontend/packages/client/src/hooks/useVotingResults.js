import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { useQuery } from '@tanstack/react-query';
import { fetchProposalResults } from 'api/proposals';

export default function useVotingResults(proposalId) {
  const { notifyError } = useErrorHandlerContext();

  const { isLoading, isError, data, error } = useQuery(
    ['proposal-results', String(proposalId)],
    async () => {
      return fetchProposalResults({ proposalId });
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
    error,
    data,
  };
}
