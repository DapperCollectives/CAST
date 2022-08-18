import { useEffect } from 'react';
import useUserCommunities from './useUserCommunities';

// REFACTOR

export default function useUserRoleOnCommunity({
  addr,
  communityId,
  roles = [],
} = {}) {
  const {
    data: communityUser,
    loading,
    pagination,
    fetchMore,
  } = useUserCommunities({
    addr,
    count: 100,
  });

  useEffect(() => {
    async function getMore() {
      await fetchMore();
    }
    if (pagination.next > 0) {
      getMore();
    }
  }, [fetchMore, pagination.next]);

  if (
    addr === null ||
    (Array.isArray(communityUser) && communityUser.length === 0)
  ) {
    return false;
  }

  if (addr === null) {
    return false;
  }

  if (loading || roles.length === 0 || !communityId) {
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
