import useUserCommunities from "./useUserCommunities";

export default function useUserRoleOnCommunity({
  addr,
  communityId,
  roles = [],
} = {}) {
  const { data: communityUser, loading } = useUserCommunities({
    addr,
  });

  if (
    addr === null ||
    (Array.isArray(communityUser) && communityUser.length === 0)
  ) {
    return false;
  }
  if (loading || roles.length === 0) {
    return null;
  }
  const rolesInCommunity =
    communityUser
      ?.filter((datum) => datum.id.toString() === communityId.toString())
      .map((community) => community?.membershipType) ?? [];

  return roles.every((role) => rolesInCommunity.includes(role));
}
