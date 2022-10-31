import { useEffect, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Svg } from '@cast/shared-components';
import { Tooltip } from 'components';
import { Flex, HStack, Text } from '@chakra-ui/react';

const WalletAddress: React.FC<{ addr: string }> = ({ addr }) => {
  const [addressCopied, setAddressCopied] = useState<boolean>(false);

  const markAddressCopied = () => setAddressCopied(true);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (addressCopied) {
      timeout = setTimeout(() => {
        setAddressCopied(false);
      }, 500);
    }
    return () => clearTimeout(timeout);
  }, [addressCopied]);

  return (
    <Tooltip
      classNames="is-flex is-flex-grow-1 is-align-items-center transition-all"
      position="top"
      text="Copied!"
      alwaysVisible={true}
      enabled={addressCopied}
    >
      <CopyToClipboard text={addr} onCopy={markAddressCopied}>
        <HStack height="32px" spacing={1} bg="grey.300" borderRadius="base">
          <Flex alignItems="center" py={1}>
            <Text fontWeight="bold" color="grey.500" fontSize="md">
              {addr}
            </Text>
          </Flex>
          <Flex alignItems="center" py={1} height="23px">
            <Svg name="Copy" />
          </Flex>
        </HStack>
      </CopyToClipboard>
    </Tooltip>
  );
};

export default WalletAddress;
