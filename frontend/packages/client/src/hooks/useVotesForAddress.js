import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { checkResponse } from 'utils';
import { useQuery } from '@tanstack/react-query';

export default function useVotesForAddress({
  proposalIds,
  addr,
  enabled = true,
} = {}) {
  const { notifyError } = useErrorHandlerContext();
  const { isLoading, isError, data, error } = useQuery(
    ['user-votes', addr, proposalIds],
    async () => {
      const response = await fetch(
        `${
          process.env.REACT_APP_BACK_END_SERVER_API
        }/votes/${addr}?proposalIds=[${proposalIds.join(',')}]`
      );

      const userVotes = await checkResponse(response);

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
