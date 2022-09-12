import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { useQuery } from '@tanstack/react-query';
import { fetchProposalUserVotes } from 'api/proposals';

export default function useVotesForAddress({
  proposalIds,
  addr,
  enabled = true,
} = {}) {
  const { notifyError } = useErrorHandlerContext();
  const { isLoading, isError, data, error } = useQuery(
    ['user-votes', addr, proposalIds],
    async ({ queryKey }) => {
      const [, addr, proposalIds] = queryKey ?? [];

      const userVotes = await fetchProposalUserVotes({ addr, proposalIds });

      return (userVotes?.data ?? []).map(({ proposalId, choice }) => ({
        [proposalId]: choice,
      }));
    },
    {
      enabled,
      onError: (error) => {
        notifyError(error);
      },
    }
  );

  return {
    isLoading,
    isError,
    error,
    data: data ?? [],
  };
}
