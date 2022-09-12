import React from 'react';
import FadeIn from 'components/FadeIn';

export default function TextArea({
  style = {},
  classNames = '',
  name,
  placeholder = '',
  register,
  disabled,
  error,
  rows = '3',
  cols = '30',
}) {
  return (
    <div>
      <textarea
        style={{ width: '100%', ...style }}
        type="text"
        className={classNames}
        placeholder={placeholder}
        {...register(name, { disabled })}
        rows={rows}
        cols={cols}
      />
      {error && (
        <FadeIn>
          <div className="pl-1 mt-2">
            <p className="smaller-text has-text-danger">{error?.message}</p>
          </div>
        </FadeIn>
      )}
    </div>
  );
}
