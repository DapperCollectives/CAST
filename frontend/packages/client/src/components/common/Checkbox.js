import FadeIn from 'components/FadeIn';

export default function Checkbox({
  labelClassNames = '',
  name,
  register,
  label,
  disabled,
  error,
} = {}) {
  return (
    <div className="is-flex flex-1">
      <label className="checkbox column is-flex is-align-items-center is-full is-full-mobile px-0 mt-4 mb-4">
        <input
          type="checkbox"
          className="mr-2 form-checkbox"
          {...register(name, { disabled })}
        />
        <p className={labelClassNames}>{label}</p>
      </label>
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
