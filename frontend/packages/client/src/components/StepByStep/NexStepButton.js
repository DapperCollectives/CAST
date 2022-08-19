import React from 'react';

const NextButton = ({
  formId: formIdParam,
  moveToNextStep,
  disabled = false,
} = {}) => {
  const classNames = `button is-block has-background-yellow rounded-sm py-2 px-4 has-text-centered ${
    disabled && 'is-disabled'
  }`;

  return (
    <div className="my-6">
      {formIdParam ? (
        <button className={classNames} form={formIdParam} type="submit">
          Next
        </button>
      ) : (
        <div className={classNames} onClick={moveToNextStep}>
          Next
        </div>
      )}
    </div>
  );
};

export default NextButton;
