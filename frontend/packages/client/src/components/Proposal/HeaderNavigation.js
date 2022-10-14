import { JoinCommunityButton } from 'components';
import { useMediaQuery, useVotesForAddress } from 'hooks';
import BackButton from './BackButton';
import ShareDropdown from './ShareDropdown';

const HeaderNavigation = ({
  communityId,
  proposalId,
  proposalName,
  addr,
} = {}) => {
  const notMobile = useMediaQuery();

  const { data: proposalVoteFromUser } = useVotesForAddress({
    enabled: Boolean(addr && proposalId),
    proposalIds: [proposalId],
    addr,
  });

  const userVoted = proposalVoteFromUser?.length > 0;

  return (
    <div
      className="is-flex mb-5 mb-3-mobile"
      style={{ justifyContent: 'space-between' }}
    >
      <BackButton isMobile={!notMobile} communityId={communityId} />
      <div className="is-flex">
        <JoinCommunityButton
          communityId={communityId}
          size={notMobile ? 'small' : 'smaller'}
        />
        <ShareDropdown
          isMobile={!notMobile}
          communityId={communityId}
          proposalId={proposalId}
          proposalName={proposalName}
          userVoted={userVoted}
        />
      </div>
    </div>
  );
};

export default HeaderNavigation;
