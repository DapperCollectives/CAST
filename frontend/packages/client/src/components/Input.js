import React from 'react';

export default function Input({
  placeholder,
  defaultValue,
  name,
  value,
  disabled,
  onChange = () => {},
} = {}) {
  return (
    <input
      type="text"
      className="rounded-sm border-light p-3 column is-full is-full-mobile mt-4"
      placeholder={placeholder}
      name={name}
      defaultValue={defaultValue}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
