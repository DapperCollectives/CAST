import { Button } from '@chakra-ui/react';

export default {
  title: 'Shared Components/Button',
  component: Button,
  argTypes: {
    size: {
      options: ['lg', 'md', 'sm'],
    },
  },
};

const Template = (args) => <Button {...args}>Button</Button>;

export const Controls = Template.bind({});
