import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { checkResponse } from 'utils';
import { useQuery } from '@tanstack/react-query';

export default function useVotingResults(proposalId) {
  const { notifyError } = useErrorHandlerContext();

  const { isLoading, isError, data, error } = useQuery(
    ['proposal-results', String(proposalId)],
    async () => {
      const response = await fetch(
        `${process.env.REACT_APP_BACK_END_SERVER_API}/proposals/${proposalId}/results`
      );

      return checkResponse(response);
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
