import { Svg } from '@cast/shared-components';
import { Card } from 'components';
import { Flex, Text } from '@chakra-ui/react';

export default function FlowCard({ title, balance }) {
  return (
    <Card variant="flowBox">
      <Text fontSize="xxs" fontWeight="bold" variant="allUpperCase">
        {title}
      </Text>
      <Flex alignItems="center" gap={2}>
        <Svg name="Flow" />
        <Text size="lg" fontSize="lg" fontWeight="bold">
          {balance} FLOW
        </Text>
      </Flex>
    </Card>
  );
}
