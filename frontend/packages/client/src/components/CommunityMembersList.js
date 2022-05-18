import React, { useEffect } from "react";
import { useCommunityMembers } from "../hooks";
import TableMembers from "./TableMembers";
import { debounce } from "../utils";
import WrapperResponsive from "./WrapperResponsive";

export default function CommunityMembersList({ communityId } = {}) {
  // number of users brought at each pull based on design
  const pageSize = 18;

  const { data, pagination, loading, fetchMore } =
    useCommunityMembers({
      communityId,
      count: pageSize,
    });

  const hasMore = pagination.next > 0;

  useEffect(() => {
    document.hasMore = hasMore;
    document.loadingProposals = loading;
    document.fetchMore = fetchMore;
  }, [hasMore, loading, fetchMore]);

  // this hook takes care of fetching more members when user scrolls to bottom of the page
  useEffect(() => {
    const pullDataFromApi = () =>
      debounce(() => {
        if (
          document.documentElement.scrollHeight <=
          window.pageYOffset + window.innerHeight
        ) {
          if (document.hasMore && !document.loadingProposals) {
            document.fetchMore();
          }
        }
      }, 500);
    document.addEventListener("scroll", pullDataFromApi());
    return () => document.removeEventListener("scroll", pullDataFromApi());
  }, []);

  return (
    <div className="is-flex is-flex-direction-column">
      <WrapperResponsive
        commonClasses="is-flex flex-1"
        extraStyles={{ marginBottom: "40px", marginTop: "40px" }}
        extraStylesMobile={{ marginBottom: "32px", marginTop: "24px" }}
      >
        <p className="has-text-weight-bold is-uppercase small-text">
          {pagination?.totalRecords ?? "..."} members
        </p>
      </WrapperResponsive>
      <div className="is-flex flex-1">
        <TableMembers
          data={data}
          loading={loading && Array.isArray(data)}
          initialLoading={loading && !data}
        />
      </div>
    </div>
  );
}
