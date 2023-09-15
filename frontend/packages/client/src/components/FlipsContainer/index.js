import { BrowseButton } from 'components';
import { useCommunityProposalsWithVotes } from 'hooks';
import { getUpdatedFlipsData } from '../../helpers';
import FlipsList from './FlipsList';
import classes from './index.module.scss';

const COMMUNITY_ID = 1;

const FlipsContainer = () => {
  // Two requests are made to the backend:
  // one will bring all active and pending proposals: "inprogress"
  // the other will bring all closed and cancelled proposals: "terminated"
  const { data: liveFLIPs, loading: loadingLiveFLIPs } =
    useCommunityProposalsWithVotes({
      communityId: COMMUNITY_ID,
      count: 25,
      status: 'inprogress',
      scrollToFetchMore: false,
    });
  const { data: concludedFLIPs, loading: loadingConcludedFLIPs } =
    useCommunityProposalsWithVotes({
      communityId: COMMUNITY_ID,
      count: 10,
      status: 'terminated',
    });

  let updatedList = getUpdatedFlipsData({
    liveProposals: liveFLIPs,
    concludedProposals: concludedFLIPs,
  });

  updatedList.length = 3;

  const initialLoading = loadingConcludedFLIPs || loadingLiveFLIPs;

  return (
    <div>
      <a
        target="_blank"
        rel="noreferrer noopener"
        href="https://github.com/onflow/flips"
        className={`${classes.linkContainer}`}
      >
        <h1
          className={`is-uppercase has-text-weight-bold mb-5 ${classes.headingClass}`}
        >
          Flow Improvement Proposals
        </h1>
      </a>

      <FlipsList proposals={updatedList} initialLoading={initialLoading} />
      <BrowseButton path={`/community/${COMMUNITY_ID}`} label={'Show more'} />
    </div>
  );
};

export default FlipsContainer;
