import React from 'react';
import classnames from 'classnames';
import Loader from 'components/Loader';

export default function ActionButton({
  enabled = true,
  onClick = () => {},
  loading = false,
  label = '',
  classNames,
} = {}) {
  const clNames = classnames(
    'button is-flex is-align-items-centered rounded-sm is-uppercase',
    'm-0 p-0',
    'has-background-yellow',
    { 'is-enabled': enabled },
    { 'is-disabled': !enabled },
    { [classNames]: !!classNames }
  );
  return (
    <button
      style={{ height: 48, width: '100%' }}
      className={clNames}
      onClick={!enabled ? () => {} : onClick}
    >
      {loading ? <Loader size={18} spacing="mx-button-loader" /> : <>{label}</>}
    </button>
  );
}
