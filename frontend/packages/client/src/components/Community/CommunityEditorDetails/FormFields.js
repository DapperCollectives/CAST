import React from 'react';
import FadeIn from 'components/FadeIn';
import { Bin, InvalidCheckMark, ValidCheckMark } from 'components/Svg';

export default function Form({
  addrList,
  register,
  onDeleteAddress,
  isSubmitting,
  errors = [],
  label,
  addrType,
  isValid,
  listName = 'addrList',
  onClearField,
} = {}) {
  const enableDeletion = addrList.length > 1;
  return (
    <>
      <div className="columns is-multiline p-0 m-0">
        {addrList.map((addrField, index) => {
          const errorInField = Array.isArray(errors?.[listName])
            ? errors?.[listName]?.[index]?.addr
            : errors?.[listName];

          const checkIcon = addrField.addr !== '';
          const inputStyle = `form-error-input-icon ${
            errorInField ? 'form-error-input-border' : ''
          }`;

          return (
            <div
              key={`index-${index}`}
              className="column is-12 is-mobile p-0 m-0 mb-4 fade-in"
              style={{ position: 'relative' }}
            >
              <input
                key={addrField.id} // important to include key with field's id
                placeholder={label || `Enter ${addrType}`}
                className={`border-light rounded-sm p-3 column is-full ${inputStyle}`}
                {...register(`${listName}.${index}.addr`, {
                  disabled: isSubmitting,
                })}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignContent: 'center',
                  position: 'absolute',
                  right: 15,
                  top: 9,
                }}
              >
                {!errorInField ? (
                  isValid && checkIcon ? (
                    <div className="is-flex is-align-items-center mr-2">
                      <ValidCheckMark />
                    </div>
                  ) : null
                ) : (
                  <div
                    className="cursor-pointer is-flex is-align-items-center mr-2"
                    onClick={() => onClearField(index)}
                  >
                    <InvalidCheckMark />
                  </div>
                )}
                {enableDeletion && (
                  <div
                    className="cursor-pointer is-flex is-align-items-center"
                    onClick={() => onDeleteAddress(index)}
                  >
                    <Bin />
                  </div>
                )}
              </div>
              {errorInField && (
                <FadeIn>
                  <div className="pl-1 mt-2">
                    <p className="smaller-text has-text-red">
                      {errorInField.message}
                    </p>
                  </div>
                </FadeIn>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
