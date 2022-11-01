import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Svg } from '@cast/shared-components';
import { useMediaQuery } from 'hooks';
import {
  Flex,
  Link,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
} from '@chakra-ui/react';

interface ShareDropdownProps {
  twitterShareString: string;
  copyString: string;
  isIconOnly?: boolean;
  offset?: [number, number];
  direction?: 'ltr' | 'rtl';
}
const ShareDropdown: React.FC<ShareDropdownProps> = ({
  isIconOnly = true,
  twitterShareString = '',
  copyString = '',
  offset,
  direction,
}) => {
  const isBiggerThanMobile = useMediaQuery();

  const twitterPost = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    twitterShareString
  )} `;

  return (
    <>
      <Menu offset={offset} direction={direction}>
        <MenuButton
          transition="all 0.2s"
          borderWidth="1px"
          borderColor="black"
          _hover={{ borderColor: 'blackAlpha.600' }}
          maxH={isBiggerThanMobile ? '40px' : '32px'}
          {...(isIconOnly
            ? { px: '13px', py: '21px', borderRadius: 'full' }
            : {
                px: 4,
                py: 2,
                borderRadius: '3xl',
              })}
        >
          <Flex alignItems="center">
            <Svg name="Share" />
            {!isIconOnly ? (
              <Text
                fontWeight="bold"
                ml={3}
                fontSize={isBiggerThanMobile ? 'md' : 'sm'}
              >
                Share
              </Text>
            ) : null}
          </Flex>
        </MenuButton>
        <MenuList borderRadius="2xl" maxW="192px" minW="192px">
          <MenuItem display="flex" alignItems="center" minHeight="48px" pl={3}>
            <CopyToClipboard text={copyString} onCopy={() => {}}>
              <Flex alignItems="center">
                <Svg name="Copy" />
                <Text fontWeight="bold" ml={3}>
                  Copy Link
                </Text>
              </Flex>
            </CopyToClipboard>
          </MenuItem>
          <MenuDivider border="light" borderColor="grey.300" my={0} />
          <MenuItem display="flex" alignItems="center" minHeight="48px" pl={3}>
            <Svg name="Twitter" />
            <Link
              href={twitterPost}
              target="_blank"
              rel="noreferrer noopenner"
              className="twitter-share-button"
              fontWeight="bold"
              ml={3}
              _hover={{ textDecoration: 'none' }}
            >
              Tweet
            </Link>
          </MenuItem>
        </MenuList>
      </Menu>
    </>
  );
};
export default ShareDropdown;
