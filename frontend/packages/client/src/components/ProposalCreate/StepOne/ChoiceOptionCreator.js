import React, { useEffect } from 'react';
import ImageChoices from './ImageChoices';
import TextBasedChoices from './TextBasedChoices';

export default function ChoiceOptionCreator({
  tabOption,
  choices,
  append,
  remove,
  replace,
  update,
  setValue = () => {},
  error = [],
  register,
  fieldName,
} = {}) {
  // tabOption value is sabed on form
  const setTab = (option) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    setValue('tabOption', option);
  };

  const onCreateChoice = (e) => {
    e.preventDefault();
    e.stopPropagation();
    append({
      value: '',
    });
  };

  const initChoices = (choices) => replace(choices);

  return (
    <>
      <div className="tabs choice-option is-toggle mt-2 mb-4">
        <ul>
          <li>
            <button
              className={`button left ${
                tabOption === 'text-based' ? 'is-black' : 'outlined'
              }`}
              onClick={setTab('text-based')}
            >
              <span>Text-based</span>
            </button>
          </li>
          <li>
            <button
              className={`button right ${
                tabOption === 'visual' ? 'is-black' : 'outlined'
              }`}
              onClick={setTab('visual')}
            >
              <span>Visual</span>
            </button>
          </li>
        </ul>
      </div>

      {tabOption === 'text-based' && (
        <TextBasedChoices
          choices={choices}
          onDestroyChoice={remove}
          onCreateChoice={onCreateChoice}
          initChoices={initChoices}
          error={error}
          register={register}
          fieldName={fieldName}
        />
      )}
      {tabOption === 'visual' && (
        <ImageChoices
          choices={choices}
          onChoiceChange={update}
          initChoices={initChoices}
          error={error}
        />
      )}
    </>
  );
}
