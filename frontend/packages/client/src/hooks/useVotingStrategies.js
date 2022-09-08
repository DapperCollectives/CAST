import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { checkResponse } from 'utils';
import { useQuery } from '@tanstack/react-query';

export default function useVotingStrategies() {
  const { notifyError } = useErrorHandlerContext();

  const { isLoading, isError, data, error } = useQuery(
    ['voting-strategies'],
    async () => {
      const response = await fetch(
        `${process.env.REACT_APP_BACK_END_SERVER_API}/voting-strategies`
      );

      return checkResponse(response);
    },
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
