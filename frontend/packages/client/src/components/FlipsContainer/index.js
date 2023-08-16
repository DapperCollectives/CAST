import { BrowseButton } from 'components';
import { useCommunityProposalsWithVotes } from 'hooks';
import FlipsList from './FlipsList';

const COMMUNITY_ID = 1;

const FlipsContainer = () => {
  // Two requests are made to the backend:
  // one will bring all active and pending proposals: "inprogress"
  // the other will bring all closed and cancelled proposals: "terminated"
  const { data: activeProposals, loading: loadingActiveProposals } =
    useCommunityProposalsWithVotes({
      communityId: COMMUNITY_ID,
      count: 25,
      status: 'inprogress',
      scrollToFetchMore: false,
    });
  const { data: remainingProposals, loading: loadingProposals } =
    useCommunityProposalsWithVotes({
      communityId: COMMUNITY_ID,
      count: 10,
      status: 'terminated',
    });

  const updatedList = [];
  if (activeProposals) {
    updatedList.push(...activeProposals);
  }
  if (remainingProposals) {
    updatedList.push(...remainingProposals);
  }
  if (updatedList.length > 3) {
    updatedList.length = 3;
  }

  const initialLoading = loadingProposals || loadingActiveProposals;

  return (
    <div>
      <h1 className={`is-uppercase has-text-weight-bold mb-5`}>Flips</h1>
      <FlipsList proposals={updatedList} initialLoading={initialLoading} />
      <BrowseButton path={`/community/${COMMUNITY_ID}`} label={'Show more'} />
    </div>
  );
};

export default FlipsContainer;
