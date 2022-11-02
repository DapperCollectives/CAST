//
// ***********************************
// Component style overrides for Chakra components
import Button from './components/Button';
import Input from './components/Input';
import Link from './components/Link';
import Tabs from './components/Tabs';
import Text from './components/Text';
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
import colors from './foundations/colors';
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
  colors,
  // Other foundational style overrides go here
  components: {
    Input,
    Card: CardStyle,
    Link,
    Text,
    Button,
    Tabs,
    // Other components go here
  },
};

export default extendTheme(overrides);
