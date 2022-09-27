import classnames from 'classnames';

export default function Pill({
  text,
  classNames,
  backgroundColorClass,
  textColorClass = 'has-text-white',
  outlined = false,
  padding = 'px-2 py-1',
  fontSize = 'smallest-text',
  fontWeight = 'has-text-weight-bold',
  onClick,
}) {
  const className = classnames(
    'rounded-lg',
    { [textColorClass]: !!textColorClass },
    { [backgroundColorClass]: !!backgroundColorClass },
    { [padding]: !!padding },
    { [fontSize]: !!fontSize },
    { [fontWeight]: !!fontWeight },
    { [classNames]: !!classNames },
    { button: !!onClick }
  );

  if (onClick) {
    return (
      <div className="is-flex" onClick={onClick}>
        <span className={className}>{text}</span>
      </div>
    );
  }
  return <span className={className}>{text}</span>;
}
