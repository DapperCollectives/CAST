import Card from './Card';

export default {
  title: 'Shared Components/Card',
  component: Card,
  argTypes: {
    variants: {
      options: ['votingType', 'flowBox', 'warning'],
    },
  },
};

const Template = (args) => <Card {...args} />;

export const Controls = Template.bind({});
