import React from 'react';

export default function Form({ removeInnerForm, children, handleSubmit }) {
  return removeInnerForm ? (
    { children }
  ) : (
    <form onSubmit={handleSubmit}>{children}</form>
  );
}
