import useUserCommunities from "./useUserCommunities";

export default function useUserRoleOnCommunity({
  addr,
  communityId,
  roles = [],
} = {}) {
  const { data: communityUser, loading } = useUserCommunities({
    addr,
  });
  if (addr === null) {
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
