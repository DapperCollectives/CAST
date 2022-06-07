import React, { useEffect } from "react";
import { Message, Loader, FadeIn } from "components";
import CommunitiesPresenter from "components/Community/CommunitiesPresenter";
import useCommunity from "hooks/useCommunity";

export default function HomePage() {
  const { data, loading, getCommunities } = useCommunity();

  useEffect(() => {
    getCommunities();
  }, [getCommunities]);

  const communities = loading
    ? []
    : (data || []).map((datum) => ({
        ...datum,
        // missing fields
        logo: datum.logo || "https://i.imgur.com/RMKXPCw.png",
        isComingSoon: datum.isComingSoon || false,
        isMember: false,
      }));

  return (
    <section className="section">
      <Message
        messageText="We are currently in alpha testing with the Flow developer community."
        labelText="Alpha"
      />
      {loading && (
        <div style={{ height: "50vh" }}>
          <Loader fullHeight />
        </div>
      )}
      {!loading && (
        <FadeIn>
          <CommunitiesPresenter title="Communities" communities={communities} />
        </FadeIn>
      )}
    </section>
  );
}
