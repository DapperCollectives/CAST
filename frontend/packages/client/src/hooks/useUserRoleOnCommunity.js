import { useCallback, useEffect, useState } from "react";
import { isEmptyArray } from "utils";
import useUserCommunities from "./useUserCommunities";

export default function useUserRoleOnCommunity({
  addr,
  communityId,
  roles = [],
} = {}) {

  const [hasRole, setHasRole] = useState();
  const { data: userCommunities, loading } = useUserCommunities({
    addr
  });

  const getUserRole = useCallback(() => {
    if (loading || isEmptyArray(roles) || !userCommunities) {
      return setHasRole(null);
    } else if (isEmptyArray(userCommunities)) {
      return setHasRole(false);
    } else {
      const rolesInCommunity = userCommunities
        .filter(({ id }) => id.toString() === communityId.toString())
        .map(({ membershipType }) => membershipType);
      const included = roles.every((role) => rolesInCommunity.includes(role));
      setHasRole(included);
    }
  }, [communityId, loading, roles, userCommunities]);

  useEffect(() => {
    getUserRole();
  }, [getUserRole]);

  return hasRole;
}
