import React from 'react';
import classnames from 'classnames';

export default function Label({ labelText = '', classNames } = {}) {
  const className = classnames(
    'has-background-black has-text-white rounded-lg px-3 py-2',
    { [classNames]: !!classNames }
  );
  return <span className={className}>{labelText}</span>;
}
