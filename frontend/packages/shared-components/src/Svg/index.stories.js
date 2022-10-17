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
        'CheckOutlined',
        'Close',
        'Copy',
        'Discord',
        'Eye',
        'ErrorOutline',
        'Email',
        'GitHub',
        'HideEye',
        'Image',
        'InfoOutLine',
        'Instagram',
        'InvalidCheckMark',
        'LinkOut',
        'Logo',
        'Plus',
        'PlusLightFill',
        'RemoveLightFill',
        'Search',
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
  name: 'ErrorOutline',
};
