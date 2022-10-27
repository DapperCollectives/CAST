import { Svg } from '@cast/shared-components';
import { Flex } from '@chakra-ui/react';

const StepNumber = ({ stepIdx, status }) => {
  // status can be active - pending - done
  if (status === 'done') {
    return <Svg name="CheckMark" circleFill="#2EAE4F" />;
  }

  return (
    <Flex
      width={8}
      height={8}
      alignItems="center"
      justifyContent="center"
      borderRadius="full"
      border={status === 'pending' ? 'light' : ''}
      bg={status === 'active' ? 'yellow.500' : ''}
      fontWeight="bold"
    >
      {stepIdx + 1}
    </Flex>
  );
};

export default StepNumber;
