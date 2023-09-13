import classnames from 'classnames';

export default function SubmitButton({
  formId: formIdParam,
  label = '',
  disabled = false,
  onSubmit = () => {},
} = {}) {
  const classNames = classnames(
    'button is-block has-background-green rounded-sm py-2 px-4 has-text-centered',
    { 'is-disabled': disabled },
    { 'is-fullwidth': !!formIdParam }
  );
  return (
    <div className="my-6">
      {formIdParam ? (
        <button className={classNames} form={formIdParam} type="submit">
          {label}
        </button>
      ) : (
        <div className={classNames} onClick={onSubmit}>
          {label}
        </div>
      )}
    </div>
  );
}
