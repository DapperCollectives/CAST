import { Svg } from '@cast/shared-components';
import { Card } from 'components';
import { Flex, Heading, Text } from '@chakra-ui/react';
import FlowCard from './FlowCard';

export default function WarningMessage({
  title,
  description,
  footerText,
  balance,
  threshold,
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
          {Boolean(threshold && balance) && (
            <Flex gap={4} flexWrap="wrap" mb={5}>
              <FlowCard title="Minimum balance required" balance={threshold} />
              <FlowCard title="Your Balance" balance={balance} />
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
