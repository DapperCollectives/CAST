import Svg from '.';

export default {
  title: 'Shared Components/Svg',
  component: Svg,
  argTypes: {
    name: {
      control: {
        type: 'select',
      },
      options: [
        'Active',
        'AngleDown',
        'AngleUp',
        'ArrowLeft',
        'ArrowLeftBold',
        'ArrowRight',
        'Bin',
        'Calendar',
        'CaretDown',
        'CheckCircle',
        'CheckMark',
        'Close',
        'Copy',
        'Discord',
        'Eye',
        'GitHub',
        'HideEye',
        'Image',
        'InfoOutLine',
        'Instagram',
        'InvalidCheckMark',
        'LinkOut',
        'Logo',
        'Plus',
        'Star',
        'Twitter',
        'Upload',
        'ValidCheckMark',
        'Website',
      ],
    },
  },
};

const Template = (args) => <Svg {...args} />;
export const Controls = Template.bind({});
Controls.args = {
  name: 'Eye',
};
