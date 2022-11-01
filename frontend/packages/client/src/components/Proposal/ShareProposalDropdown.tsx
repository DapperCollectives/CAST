import { ShareDropdown } from 'components';
import { FRONTEND_URL } from 'const';
import { Box } from '@chakra-ui/react';

interface ShareProposalDropdownProps {
  communityId: string;
  proposalId: string;
  proposalName: string;
  userVoted: boolean;
}
const ShareProposalDropdown: React.FC<ShareProposalDropdownProps> = (
  {
    communityId,
    proposalId,
    proposalName = '',
    userVoted,
  } = {} as ShareProposalDropdownProps
) => {
  const proposalUrl = `${FRONTEND_URL}/#/community/${communityId}/proposal/${proposalId}`;

  const twitterPost = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    userVoted
      ? `I just voted on ${proposalName} on CAST! ${proposalUrl}`
      : `Check out ${proposalName} on CAST! ${proposalUrl}`
  )} `;

  return (
    <Box ml={4}>
      <ShareDropdown
        isIconOnly={false}
        twitterShareString={twitterPost}
        copyString={proposalUrl}
        offset={[-85, 2]}
        direction="rtl"
      />
    </Box>
  );
};
export default ShareProposalDropdown;
