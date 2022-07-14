import { useQuery } from 'react-query';
import { useErrorHandlerContext } from '../contexts/ErrorHandler';
import fetchLeaderBoard from 'api/leaderboard';

export default function useLeaderBoard({ communityId = 0, addr = '' } = {}) {
  const { notifyError } = useErrorHandlerContext();
  const { isLoading, isError, data, error } = useQuery(
    ['leaderboard', addr],
    async () => fetchLeaderBoard(communityId, addr)
  );

  if (isError) {
    notifyError(error);
  }

  const leaderBoard = data?.data?.Users ?? [];
  const currentUser = data?.data?.CurrentUser;

  return {
    isLoading,
    isError,
    error,
    data: {
      leaderBoard,
      currentUser: currentUser?.addr ? currentUser : undefined,
    },
  };
}
