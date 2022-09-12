import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { useQuery } from '@tanstack/react-query';
import { fetchVotingStrategies } from 'api/votingStrategies';

export default function useVotingStrategies() {
  const { notifyError } = useErrorHandlerContext();

  const { isLoading, isError, data, error } = useQuery(
    ['voting-strategies'],
    fetchVotingStrategies,

    {
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
