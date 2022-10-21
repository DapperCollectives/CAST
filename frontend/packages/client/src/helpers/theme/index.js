// Component style overrides
import Input from './components/Input';
import { extendTheme } from '@chakra-ui/react';
// Global style overrides
import definitions from './definitions';
// Foundational style overrides
import borders from './foundations/borders';
import styles from './styles';

const overrides = {
  ...definitions,
  styles,
  borders,
  // Other foundational style overrides go here
  components: {
    Input,
    // Other components go here
  },
};

export default extendTheme(overrides);
