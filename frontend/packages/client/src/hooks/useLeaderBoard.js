import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { useQuery } from '@tanstack/react-query';
import { fetchLeaderBoard } from 'api/community';

export default function useLeaderBoard({ communityId = 0, addr = '' } = {}) {
  const { notifyError } = useErrorHandlerContext();
  const { isLoading, isError, data, error } = useQuery(
    ['leaderboard', addr],
    async () => fetchLeaderBoard(communityId, addr),
    {
      keepPreviousData: true,
    }
  );

  if (isError) {
    notifyError(error);
  }

  const users = data?.data?.users ?? [];
  const currentUser = data?.data?.currentUser;

  return {
    isLoading,
    isError,
    error,
    data: {
      users,
      currentUser: currentUser?.addr ? currentUser : undefined,
    },
  };
}
