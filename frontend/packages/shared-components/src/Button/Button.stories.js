import { Button } from '@chakra-ui/react';

export default {
  title: 'Shared Components/Button',
  component: Button,
  argTypes: {
    size: {
      control: {
        type: 'select',
      },
      options: ['lg', 'md', 'sm'],
    },
    border: {
      control: {
        type: 'select',
      },
      options: ['', 'light'],
    },
    bgColor: {
      control: {
        type: 'select',
      },
      options: ['yellow.500', 'grey.300'],
    },
  },
};

const Template = (args) => <Button {...args}>Button</Button>;

export const Controls = Template.bind({});
