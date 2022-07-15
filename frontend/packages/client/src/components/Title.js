import React from 'react';

const Title = ({ children, className }) => (
  <h6
    className={`small-text has-text-weight-bold is-uppercase mb-1 ${className}`}
  >
    {children}
  </h6>
);

export default Title;
