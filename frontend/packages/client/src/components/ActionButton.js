import React from 'react';
import Loader from 'components/Loader';
import classnames from 'classnames';

export default function ActionButton({
  enabled = true,
  onClick = () => {},
  loading = false,
  label = '',
  classNames,
  type,
  isUppercase = true,
  roundedClass = 'rounded-sm',
  height = 48,
} = {}) {
  const clNames = classnames(
    'button is-flex is-align-items-centered ',
    'm-0 p-0',
    'has-background-yellow',
    { 'is-enabled': enabled },
    { 'is-disabled': !enabled },
    { 'is-uppercase': isUppercase },
    { [roundedClass]: !!roundedClass },
    { [classNames]: !!classNames }
  );
  return (
    <button
      type={type}
      style={{ height, width: '100%' }}
      className={clNames}
      onClick={!enabled ? () => {} : onClick}
    >
      {loading ? <Loader size={18} spacing="mx-button-loader" /> : <>{label}</>}
    </button>
  );
}
