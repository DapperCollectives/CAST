import React from "react";
import { useParams, useHistory, useLocation } from "react-router-dom";
import Proposals from "../components/Proposals";
import useCommunityDetails from "../hooks/useCommunityDetails";

function useQueryParams() {
  const { search } = useLocation();
  return React.useMemo(() => {
    const params = new URLSearchParams(search);
    return {
      activeTab: params.get("tab") || "proposals",
    };
  }, [search]);
}

export default function Community() {
  const { communityId } = useParams();
  const history = useHistory();
  const { activeTab } = useQueryParams();

  // simple validation to have right query param
  if (!["proposals", "about"].includes(activeTab)) {
    history.push({
      pathname: `/community/${communityId}?tab=proposals`,
    });
  }

  const { data: community, loading, error } = useCommunityDetails(communityId);

  if (error) {
    return null;
  }

  return (
    <section className="container is-flex full-height">
      {!loading && <Proposals community={community} activeTab={activeTab} />}
    </section>
  );
}
