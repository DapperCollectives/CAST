import { JoinCommunityButton } from 'components';
import { useMediaQuery } from 'hooks';
import BackButton from './BackButton';
import ShareDropdown from './ShareDropdown';

const HeaderNavigation = ({ communityId, proposalId } = {}) => {
  const notMobile = useMediaQuery();

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
        />
      </div>
    </div>
  );
};

export default HeaderNavigation;
