import { Svg } from '@cast/shared-components';
import classnames from 'classnames';

interface AddButtonProps {
  onAdd: () => void;
  disabled?: boolean;
  addText: string;
  className: string;
}

const AddButton: React.FC<AddButtonProps> = ({
  onAdd = () => {},
  disabled = false,
  addText = '',
  className = '',
}) => {
  const classNames = classnames(
    'is-flex is-align-items-centered',
    {
      [className]: !!className,
    },
    { 'is-disabled has-text-grey': disabled },
    { 'cursor-pointer': !disabled }
  );
  const onClick = !disabled ? onAdd : () => {};
  const fill = disabled ? 'hsl(0, 0%, 48%)' : 'black';

  return (
    <div className={classNames} onClick={onClick}>
      <Svg name="Plus" fill={fill} />{' '}
      <span className="ml-2 small-text is-flex is-align-items-center">
        Add{` ${addText}`}
      </span>
    </div>
  );
};

export default AddButton;
