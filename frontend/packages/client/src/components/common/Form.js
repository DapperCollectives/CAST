import React, { forwardRef } from 'react';

const Form = forwardRef((props, ref) => {
  const { removeInnerForm, children, onSubmit, formId } = props;

  return removeInnerForm ? (
    <>{children}</>
  ) : (
    <form onSubmit={onSubmit} id={formId} ref={ref}>
      <>ddffdfdf {formId}</>
      {children}
    </form>
  );
});

export default Form;
