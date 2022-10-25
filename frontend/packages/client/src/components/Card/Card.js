import { Box, useStyleConfig } from '@chakra-ui/react';

export default function Card(props) {
  const { variant, ...rest } = props;

  const styles = useStyleConfig('Card', { variant });

  // Pass the computed styles into the `__css` prop
  return <Box __css={styles} {...rest} />;
}
