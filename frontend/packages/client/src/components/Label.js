import classnames from 'classnames';

export default function Label({
  labelText = '',
  padding = 'px-3 py-2',
  classNames,
} = {}) {
  const className = classnames(
    'has-background-black has-text-white rounded-lg',
    { [padding]: !!padding },
    { [classNames]: !!classNames }
  );
  return <span className={className}>{labelText}</span>;
}
