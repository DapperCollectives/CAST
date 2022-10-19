import FadeIn from 'components/FadeIn';

export default function Input({
  style = {},
  classNames = '',
  name,
  placeholder = '',
  register,
  disabled,
  error,
  type = 'text',
  conatinerClassNames = '',
  currentLength,
  maxLengthSize,
} = {}) {
  const showCharCount = Boolean(currentLength && maxLengthSize);
  return (
    <div
      className={`is-flex is-flex-direction-column flex-1 ${conatinerClassNames}`.trim()}
      style={showCharCount ? { position: 'relative' } : {}}
    >
      <input
        type={type}
        style={{ width: '100%', ...style }}
        placeholder={placeholder}
        className={showCharCount ? `${classNames} pr-7` : classNames}
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
