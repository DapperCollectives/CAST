import React from 'react';
import FadeIn from 'components/FadeIn';

export default function Form({
  formFields,
  register,
  isSubmitting,
  errors,
} = {}) {
  return (
    <>
      {formFields.map((formField, index) => (
        <React.Fragment key={`form-field-${index}`}>
          <div
            style={{ position: 'relative' }}
            className="is-flex is-align-items-center mt-4"
          >
            <input
              type="text"
              placeholder={formField?.placeholder}
              {...register(formField.fieldName, { disabled: isSubmitting })}
              className="rounded-sm border-light py-3 pr-3 column is-full"
              style={{
                paddingLeft: '34px',
              }}
            />
            <div
              className="pl-3"
              style={{
                position: 'absolute',
                height: 18,
                opacity: 0.3,
              }}
            >
              {formField.iconComponent}
            </div>
          </div>
          {errors[formField.fieldName] && (
            <FadeIn>
              <div className="pl-1 mt-2">
                <p className="smaller-text has-text-red">
                  {errors[formField.fieldName]?.message}
                </p>
              </div>
            </FadeIn>
          )}
        </React.Fragment>
      ))}
    </>
  );
}
