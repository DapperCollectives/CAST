import { Svg } from '@cast/shared-components';
import { Card } from 'components';
import { Flex, Heading, Text } from '@chakra-ui/react';
import FlowCard from './FlowCard';

export default function WarningMessage({ title, description, footerText }) {
  return (
    <Card variant="warning">
      <Flex>
        <Flex>
          <Svg name="ErrorOutline" width="24" height="24" color="#F54339" />
        </Flex>
        <Flex pl={6} direction="column">
          <Heading as="h4" fontSize="xl" mb={2}>
            {title}
          </Heading>
          <Text size="lg" fontSize="lg" fontWeight="medium" mb={5}>
            {description}
          </Text>
          <Flex gap={4} flexWrap="wrap">
            <FlowCard title="Minimum balance required" balance={22} />
            <FlowCard title="Your Balance" balance={22} />
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
}
