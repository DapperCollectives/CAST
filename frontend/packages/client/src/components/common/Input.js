import FadeIn from 'components/FadeIn';
import classnames from 'classnames';

export default function Input({
  style = {},
  classNames = '',
  name,
  placeholder = '',
  register,
  disabled,
  error,
  type = 'text',
  containerClassNames = '',
  currentLength,
  maxLengthSize,
} = {}) {
  const showCharCount = Boolean(currentLength && maxLengthSize);
  const borderClass = error ? 'border-danger' : 'border-light';
  const inputClasses = classnames(
    'column is-full rounded-sm p-3',
    classNames,
    borderClass,
    {
      'pr-7': showCharCount,
    }
  );

  return (
    <div
      className={`is-flex is-flex-direction-column flex-1 ${containerClassNames}`.trim()}
      style={showCharCount ? { position: 'relative' } : {}}
    >
      <input
        type={type}
        style={{ width: '100%', ...style }}
        placeholder={placeholder}
        className={inputClasses}
        {...register(name, { disabled })}
      />
      {showCharCount && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignContent: 'center',
            position: 'absolute',
            right: 12,
            top: 11,
          }}
          className="small-text has-text-grey"
        >
          {currentLength ?? 0}/{maxLengthSize}
        </div>
      )}
      {error && (
        <FadeIn>
          <div className="pl-1 mt-2">
            <p className="smaller-text has-text-danger">{error?.message}</p>
          </div>
        </FadeIn>
      )}
    </div>
  );
}
