import Blockies from 'react-blockies';
import { Svg } from '@cast/shared-components';

const ProposalCardHeader = ({ creatorAddr, isAdminProposal }) => {
  return (
    <div className={'is-flex is-align-items-center pb-3'}>
      <Blockies
        seed={creatorAddr}
        size={6}
        scale={4}
        className="blockies blockies-border"
      />
      <span className="pl-2 pr-1 has-text-black is-size-7">{creatorAddr}</span>
      {isAdminProposal && (
        <Svg name="Star" fill="#F4AF4A" width="12" height="12" />
      )}
    </div>
  );
};

export default ProposalCardHeader;
