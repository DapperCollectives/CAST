import classnames from 'classnames';

const NavButton = ({
  classNames,
  disabled = false,
  onClick,
  text = '',
  formId: formIdParam,
  styles = {},
} = {}) => {
  const classes = classnames(
    'button transition-all is-flex is-align-items-center has-text-weight-bold py-2 px-5 rounded-xl',
    { 'is-disabled': disabled },
    { [classNames]: !!classNames }
  );
  return (
    <>
      {formIdParam ? (
        <button
          className={classes}
          form={formIdParam}
          type="submit"
          style={{ minWidth: '94px', ...styles }}
        >
          <span>{text}</span>
        </button>
      ) : (
        <div
          className={classes}
          onClick={!disabled ? onClick : () => {}}
          style={{ minWidth: '94px', ...styles }}
        >
          <span>{text}</span>
        </div>
      )}
    </>
  );
};

export default NavButton;
