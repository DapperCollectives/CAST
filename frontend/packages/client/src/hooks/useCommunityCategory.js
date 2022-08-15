import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { useQuery } from '@tanstack/react-query';
import { fetchCommunityCategories } from 'api/communityCategory';

export default function useCommunityCategory() {
  const { notifyError } = useErrorHandlerContext();

  const { isLoading, isError, data, error } = useQuery(
    ['community-categories'],
    async () => fetchCommunityCategories()
  );

  if (isError) {
    notifyError(error, 'community-categories');
  }

  return {
    isLoading,
    isError,
    error,
    data,
  };
}
