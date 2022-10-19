import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  styles: {
    global: (props) => ({
      body: {
        bg: 'transparent',
      },
    }),
  },
});

export default theme;
