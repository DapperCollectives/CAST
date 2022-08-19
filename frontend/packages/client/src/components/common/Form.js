import React from 'react';

const Form = ({ removeInnerForm = false, children, onSubmit, formId } = {}) => {
  return removeInnerForm ? (
    <>{children}</>
  ) : (
    <form onSubmit={onSubmit} id={formId}>
      {children}
    </form>
  );
};

export default Form;
