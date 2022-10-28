import { Container } from '@chakra-ui/react';

interface Props {
  children?: React.ReactNode;
}

const PageContainer: React.FC<Props> = ({ children }) => {
  return (
    <Container maxW="1320px" pt="40px" px="20px" centerContent>
      {children}
    </Container>
  );
};

export default PageContainer;
