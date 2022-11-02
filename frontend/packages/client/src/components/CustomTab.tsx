import { forwardRef } from 'react';
import { Svg } from '@cast/shared-components';
import {
  Flex,
  HStack,
  Tab,
  useMultiStyleConfig,
  useTab,
} from '@chakra-ui/react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTab = forwardRef<HTMLElement, any>((props, ref) => {
  // 1. Reuse the `useTab` hook
  const tabProps = useTab({ ...props, ref });
  const isSelected = !!tabProps['aria-selected'];

  // 2. Hook into the Tabs `size`, `variant`, props
  const styles = useMultiStyleConfig('Tabs', tabProps);

  return (
    <Tab __css={styles.tab} {...tabProps}>
      <HStack spacing={2}>
        <Flex {...(isSelected ? { fontWeight: 'bold' } : {})}>
          {tabProps.children}
        </Flex>
        {isSelected ? (
          <Svg name="Star" width="13" height="13" fill="black" />
        ) : null}
      </HStack>
    </Tab>
  );
});

export default CustomTab;
