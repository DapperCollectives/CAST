import classnames from 'classnames';

export default function StatusPill({
  status,
  classNames,
  backgroundColorClass,
  textColorClass = 'has-text-white',
  outlined = false,
}) {
  const className = classnames(
    'px-2 py-1 rounded-lg smallest-text has-text-weight-bold',
    { [textColorClass]: !!textColorClass },
    { [backgroundColorClass]: !!backgroundColorClass },
    { [classNames]: !!classNames }
  );

  return <span className={className}>{status}</span>;
}
