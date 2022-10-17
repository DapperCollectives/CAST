import classnames from 'classnames';

export default function FilterPill({
  text,
  classNames,
  selected,
  onClick,
  amount,
  borderColor,
}) {
  const isDisabled = Number(amount) === 0;
  const className = classnames(
    'rounded-lg mx-2 mt-2 px-4 py-2 button pill-border',
    { 'has-text-black': !selected && !isDisabled },
    { 'has-text-white has-background-black': selected && !isDisabled },
    { [borderColor]: !!borderColor && !selected && !isDisabled },
    { 'pill-border-disabled': isDisabled },
    { [classNames]: !!classNames }
  );

  return (
    <div
      className="is-flex"
      onClick={!isDisabled ? () => onClick(text) : () => {}}
    >
      <div className={className}>
        <p>
          <span className="has-text-weight-bold">{text}</span> {amount}
        </p>
      </div>
    </div>
  );
}
