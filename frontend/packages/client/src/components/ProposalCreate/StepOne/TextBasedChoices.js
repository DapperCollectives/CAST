import { Fragment, useEffect } from 'react';
import { useFieldArray } from 'react-hook-form';
import { Svg } from '@cast/shared-components';
import { AddButton, FadeIn } from 'components';

const TextBasedChoices = ({
  fieldName = 'choices',
  register,
  error,
  control,
  clearErrors,
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

  // when choices.length === 2 error for min(2) on schema is not removed: this causes the error to be listed
  // without cleaning the error message user is able to submit (which is expected, and the error is removed)
  // This useEffect handles cleaning the error message
  useEffect(() => {
    if (
      choices.length === 2 &&
      choices[1].value === '' &&
      error?.message === 'Please add a choice, minimun amout is two'
    ) {
      clearErrors('choices');
    }
  }, [choices, clearErrors, error]);

  return (
    <>
      {choices?.map((choice, index) => {
        const errorInField = Array.isArray(error)
          ? error?.[index]?.value
          : null;
        return (
          <Fragment key={index}>
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
                <Svg name="Bin" />
              </div>
            </div>
            {errorInField && (
              <FadeIn>
                <div className="pl-1 mt-2 mb-4">
                  <p className="smaller-text has-text-danger">
                    {errorInField.message}
                  </p>
                </div>
              </FadeIn>
            )}
          </Fragment>
        );
      })}
      {error?.message && (
        <FadeIn>
          <div className="pl-1">
            <p className="smaller-text has-text-danger">{error.message}</p>
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
