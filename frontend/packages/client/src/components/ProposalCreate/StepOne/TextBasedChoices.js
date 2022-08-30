import React from 'react';
import { useFieldArray } from 'react-hook-form';
import AddButton from 'components/AddButton';
import FadeIn from 'components/FadeIn';
import { Bin } from 'components/Svg';

const TextBasedChoices = ({
  fieldName = 'choices',
  register,
  error,
  control,
} = {}) => {
  const {
    fields: choices,
    append,
    remove,
  } = useFieldArray({
    control,
    name: 'choices',
    focusAppend: true,
  });

  const onCreateChoice = (e) => {
    e.preventDefault();
    e.stopPropagation();
    append({
      value: '',
    });
  };

  return (
    <>
      {choices?.map((choice, index) => {
        const errorInField = Array.isArray(error)
          ? error?.[index]?.value
          : null;
        return (
          <React.Fragment key={index}>
            <div
              key={`container-${index}`}
              className="columns is-mobile p-0 m-0"
              style={{ position: 'relative' }}
            >
              <input
                type="text"
                placeholder="Enter choice name"
                key={choice.id}
                className={`border-light rounded-sm p-3 column is-full pr-6 ${
                  !errorInField ? 'mb-4' : ''
                }`}
                {...register(`${fieldName}.${index}.value`)}
              />
              <div
                className="cursor-pointer"
                style={{
                  position: 'absolute',
                  right: 15,
                  top: 7,
                }}
                onClick={() => remove(index)}
              >
                <Bin />
              </div>
            </div>
            {errorInField && (
              <FadeIn>
                <div className="pl-1 mt-2 mb-4">
                  <p className="smaller-text has-text-red">
                    {errorInField.message}
                  </p>
                </div>
              </FadeIn>
            )}
          </React.Fragment>
        );
      })}
      {error?.message && (
        <FadeIn>
          <div className="pl-1">
            <p className="smaller-text has-text-red">{error.message}</p>
          </div>
        </FadeIn>
      )}
      <div className="is-flex">
        <AddButton
          onAdd={onCreateChoice}
          className="mt-2 pr-2"
          addText={`${choices?.length >= 1 ? 'Another ' : ''}Choice`}
        />
      </div>
    </>
  );
};
export default TextBasedChoices;
