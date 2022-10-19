const Form = ({
  removeInnerForm = false,
  children,
  onSubmit,
  formId,
  formClasses = '',
} = {}) => {
  // TODO: make enter to jump to next input field on form
  const checkKeyDown = (e) => {
    if (e.code === 'Enter') e.preventDefault();
  };
  return removeInnerForm ? (
    <>{children}</>
  ) : (
    <form
      onSubmit={onSubmit}
      id={formId}
      onKeyDown={(e) => checkKeyDown(e)}
      className={formClasses}
    >
      {children}
    </form>
  );
};

export default Form;
