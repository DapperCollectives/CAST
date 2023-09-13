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
  readOnly = false,
} = {}) {
  return (
    <div
      className={`is-flex is-flex-direction-column flex-1 ${conatinerClassNames}`.trim()}
    >
      <input
        type={type}
        style={{ width: '100%', ...style }}
        placeholder={placeholder}
        className={classNames}
        readOnly={readOnly}
        {...register(name, { disabled })}
      />
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
