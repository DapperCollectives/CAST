import React from 'react';
import DatePicker from 'react-datepicker';
import { Controller } from 'react-hook-form';
import FadeIn from 'components/FadeIn';

export default function CustomDatePicker({
  control,
  fieldName,
  notMobile,
  minDate,
  maxDate,
  disabled = false,
  placeholderText,
} = {}) {
  return (
    <Controller
      control={control}
      name={fieldName}
      render={({ field }) => (
        <DatePicker
          placeholderText={placeholderText}
          selected={field.value}
          minDate={minDate ?? new Date()}
          maxDate={maxDate}
          onFocus={(e) => !notMobile && e.target.blur()}
          onChange={(date) => field.onChange(date)}
          className="border-light rounded-sm column is-full is-full-mobile p-3"
          disabled={disabled}
        />
      )}
    />
  );
}
