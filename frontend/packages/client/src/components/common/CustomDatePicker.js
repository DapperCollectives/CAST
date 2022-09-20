import DatePicker from 'react-datepicker';
import { Controller } from 'react-hook-form';
import { Svg } from '@cast/shared-components';
import FadeIn from 'components/FadeIn';

export default function CustomDatePicker({
  control,
  fieldName,
  notMobile,
  minDate,
  maxDate,
  disabled = false,
  placeholderText,
  errorMessage,
} = {}) {
  return (
    <div className="columns is-multiline p-0 m-0 is-flex-grow-1">
      <div
        className="p-0 pr-2 p-0-mobile mb-4-mobile m-0 column is-fullwidth"
        style={{ position: 'relative' }}
      >
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
        <div
          style={{
            position: 'absolute',
            right: 15,
            top: 7,
            pointerEvents: 'none',
          }}
        >
          <Svg name="Calendar" />
        </div>
      </div>
      {errorMessage && (
        <div className="column p-0 is-12">
          <FadeIn>
            <div className="pl-1 mt-2 mb-4">
              <p className="smaller-text has-text-danger">{errorMessage}</p>
            </div>
          </FadeIn>
        </div>
      )}
    </div>
  );
}
