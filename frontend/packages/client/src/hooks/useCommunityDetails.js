import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { useQuery } from '@tanstack/react-query';
import { fetchCommunityDetails } from 'api/community';

export default function useCommunityDetails(id) {
  const { notifyError } = useErrorHandlerContext();

  const { isLoading, isError, data, error } = useQuery(
    ['community-details', id],
    async () => fetchCommunityDetails(id),
    {
      enabled: !!id,
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
