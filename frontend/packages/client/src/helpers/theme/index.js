import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  styles: {
    global: (props) => ({
      'html, body': {
        bg: 'transparent',
        lineHeight: 'normal',
      },
    }),
  },
});

export default theme;
