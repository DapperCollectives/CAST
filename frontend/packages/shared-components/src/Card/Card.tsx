import { Box, useStyleConfig } from '@chakra-ui/react';

interface CardProps {
  variant: 'votingType' | 'flowBox' | 'warning';
}

const Card: React.FC<CardProps> = (props) => {
  const { variant, ...rest } = props;

  const styles = useStyleConfig('Card', { variant });

  // Pass the computed styles into the `__css` prop
  return <Box __css={styles} {...rest} />;
};

export default Card;
