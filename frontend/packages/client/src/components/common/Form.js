import React from 'react';

export default function Form({ removeInnerForm, children, onSubmit }) {
  return removeInnerForm ? (
    { children }
  ) : (
    <form onSubmit={onSubmit}>{children}</form>
  );
}
