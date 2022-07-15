import { useQuery } from 'react-query';
import { useErrorHandlerContext } from '../contexts/ErrorHandler';
import fetchLeaderBoard from 'api/leaderboard';

export default function useLeaderBoard({ communityId = 0 } = {}) {
  const { notifyError } = useErrorHandlerContext();
  const { isLoading, isError, data, error } = useQuery(
    ['leaderboard'],
    async () => fetchLeaderBoard(communityId)
  );

  if (isError) {
    notifyError(error);
  }

  return {
    isLoading,
    isError,
    error,
    data: {
      leaderBoard: data?.data ?? [],
      currentUser: {
        addr: 'joshprin...',
        score: '123 $XYZ',
        index: 122,
      },
    },
  };
}
