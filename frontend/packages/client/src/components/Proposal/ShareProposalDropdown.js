import { ShareDropdown } from 'components';
import { FRONTEND_URL } from 'const';
import { Box } from '@chakra-ui/react';

export default function ShareProposalDropdown({
  communityId,
  proposalId,
  proposalName = '',
  userVoted,
} = {}) {
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
      />
    </Box>
  );
}
