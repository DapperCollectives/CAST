import React, { useEffect } from 'react';
import AddButton from 'components/AddButton';
import FadeIn from 'components/FadeIn';
import { Bin } from 'components/Svg';
import { getProposalType } from 'utils';

const TextBasedChoices = ({
  choices = [],
  fieldName = 'choices',
  register,
  onDestroyChoice,
  onCreateChoice,
  initChoices,
  error,
} = {}) => {
  useEffect(() => {
    if (getProposalType(choices) !== 'text-based') {
      initChoices([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {choices?.map((choice, index) => {
        const errorInField = Array.isArray(error)
          ? error?.[index]?.value
          : null;
        return (
          <React.Fragment key={choice.id}>
            <div
              key={choice.id}
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
                autoFocus
              />
              <div
                className="cursor-pointer"
                style={{
                  position: 'absolute',
                  right: 15,
                  top: 7,
                }}
                onClick={() => onDestroyChoice(index)}
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
