import { ShareDropdown } from 'components';
import { FRONTEND_URL } from 'const';
import { Box } from '@chakra-ui/react';

interface ShareProfileDropdownProps {
  userAddr: string;
}
const ShareProfileDropdown: React.FC<ShareProfileDropdownProps> = ({
  userAddr,
}) => {
  const profileUrl = `${FRONTEND_URL}/#/profile?addr=${userAddr}`;

  const twitterPost = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `Check at my profile in ${profileUrl} on CAST! `
  )} `;

  return (
    <Box ml={4}>
      <ShareDropdown
        isIconOnly={true}
        twitterShareString={twitterPost}
        copyString={profileUrl}
      />
    </Box>
  );
};
export default ShareProfileDropdown;
