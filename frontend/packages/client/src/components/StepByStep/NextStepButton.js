import classnames from 'classnames';

const NextStepButton = ({
  formId: formIdParam,
  moveToNextStep,
  disabled = false,
} = {}) => {
  const classNames = classnames(
    'button is-block has-background-yellow rounded-sm py-2 px-4 has-text-centered',
    { 'is-disabled': disabled },
    { 'is-fullwidth': !!formIdParam }
  );
  return (
    <>
      {formIdParam ? (
        <button className={classNames} form={formIdParam} type="submit">
          Next
        </button>
      ) : (
        <div className={classNames} onClick={moveToNextStep}>
          Next
        </div>
      )}
    </>
  );
};

export default NextStepButton;
