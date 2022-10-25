import { Svg } from '@cast/shared-components';
import { Card } from 'components';
import { Flex, Text } from '@chakra-ui/react';

export default function TokenCard({ title, balance, contractName = '' }) {
  return (
    <Card variant="flowBox">
      <Text fontSize="xxs" fontWeight="bold" variant="allUpperCase">
        {title}
      </Text>
      <Flex alignItems="center" gap={2}>
        {contractName.toUpperCase() === 'FLOWTOKEN' && <Svg name="Flow" />}
        <Text size="lg" fontSize="lg" fontWeight="bold">
          {balance} FLOW
        </Text>
      </Flex>
    </Card>
  );
}
