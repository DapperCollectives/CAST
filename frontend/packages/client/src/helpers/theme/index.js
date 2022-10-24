//
// ***********************************
// Component style overrides for Chakra components
import Input from './components/Input';
// ***********************************
//
// ***********************************
// Custom components style definitions
import { CardStyle } from 'components/Card';
// ***********************************
import { extendTheme } from '@chakra-ui/react';
//
// ***********************************
// Global definitions overrides
import definitions from './definitions';
// ***********************************
//
// Foundational style overrides
import borders from './foundations/borders';
// ***********************************
//
// ***********************************
// Global style overrides
import styles from './styles';

// ***********************************

const overrides = {
  ...definitions,
  styles,
  borders,
  // Other foundational style overrides go here
  components: {
    Input,
    Card: CardStyle,
    // Other components go here
  },
};

export default extendTheme(overrides);
