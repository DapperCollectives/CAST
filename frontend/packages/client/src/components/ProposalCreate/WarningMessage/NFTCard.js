import { Card } from 'components';
import { Flex, Text } from '@chakra-ui/react';

export default function FlowCard({ title, balance, contractName }) {
  return (
    <Card variant="flowBox">
      <Text fontSize="xxs" fontWeight="bold" variant="allUpperCase">
        {title}
      </Text>
      <Flex alignItems="center" gap={2}>
        <Text size="lg" fontSize="lg" fontWeight="bold">
          {balance} {contractName} NFT
        </Text>
      </Flex>
    </Card>
  );
}
