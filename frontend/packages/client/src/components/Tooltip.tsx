interface TooltipProps {
  enabled: boolean;
  position: 'left' | 'right' | 'top' | 'bottom';
  text: string;
  children?: React.ReactNode;
  classNames: string;
  alwaysVisible: boolean;
}
const Tooltip: React.FC<TooltipProps> = ({
  enabled = true,
  position,
  text,
  children,
  classNames = '',
  alwaysVisible = false,
}) => {
  const positionConfig = {
    left: 'has-tooltip-left',
    right: 'has-tooltip-right',
    top: 'has-tooltip-top',
    bottom: 'has-tooltip-bottom',
  };
  const className = `${positionConfig[position] ?? ''}${
    alwaysVisible ? ' has-tooltip-active' : ''
  }`;

  const props = enabled ? { 'data-tooltip': text } : {};

  return (
    <span className={`has-tooltip-arrow ${className} ${classNames}`} {...props}>
      {children}
    </span>
  );
};

export default Tooltip;
