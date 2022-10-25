import { Svg } from '@cast/shared-components';
import { Card } from 'components';
import { Flex, Heading, Text } from '@chakra-ui/react';
import NFTCard from './NFTCard';
import TokenCard from './TokenCard';

export default function WarningMessage({
  title,
  description,
  footerText,
  balance,
  threshold,
  contractType,
  contractName,
}) {
  return (
    <Card variant="warning">
      <Flex>
        <Flex>
          <Svg name="ErrorOutline" width="24" height="24" color="#F54339" />
        </Flex>
        <Flex pl={6} direction="column">
          <Heading as="h4" fontSize="lg" mb={2}>
            {title}
          </Heading>
          <Text size="lg" fontSize="lg" fontWeight="medium" mb={5}>
            {description}
          </Text>
          {contractType === 'ft' && (
            <Flex gap={4} flexWrap="wrap" mb={5}>
              <TokenCard
                title="Minimum balance required"
                balance={threshold}
                contractName={contractName}
              />
              <TokenCard
                title="Your Balance"
                balance={balance}
                contractName={contractName}
              />
            </Flex>
          )}
          {contractType === 'nft' && (
            <Flex gap={4} flexWrap="wrap" mb={5}>
              <NFTCard
                title="NFT Required"
                balance={threshold}
                contractName={contractName}
              />
            </Flex>
          )}
          {footerText && (
            <Text size="lg" fontSize="xs" color="grey.500" fontWeight="medium">
              {footerText}
            </Text>
          )}
        </Flex>
      </Flex>
    </Card>
  );
}
