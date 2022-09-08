import { useEffect } from 'react';
import useUserCommunities from './useUserCommunities';

export default function useUserRoleOnCommunity({
  addr,
  communityId,
  roles = [],
} = {}) {
  const {
    data: communityUser,
    isLoading,
    pagination,
    fetchNextPage,
  } = useUserCommunities({
    addr,
    count: 100,
  });

  useEffect(() => {
    async function getMore() {
      await fetchNextPage();
    }
    if (pagination.next > 0) {
      getMore();
    }
  }, [fetchNextPage, pagination.next]);

  if (
    addr === null ||
    (Array.isArray(communityUser) && communityUser.length === 0)
  ) {
    return false;
  }

  if (addr === null) {
    return false;
  }

  if (isLoading || roles.length === 0 || !communityId) {
    return null;
  }
  if (pagination.next > 0) {
    return null;
  }

  const rolesInCommunity =
    communityUser
      ?.find((datum) => {
        return datum.id.toString() === communityId.toString();
      })
      ?.roles?.split(',') ?? [];

  return roles.every((role) => rolesInCommunity.includes(role));
}
