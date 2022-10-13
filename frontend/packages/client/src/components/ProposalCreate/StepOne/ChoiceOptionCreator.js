import { useWatch } from 'react-hook-form';
import ImageChoices from './ImageChoices';
import TextBasedChoices from './TextBasedChoices';

export default function ChoiceOptionCreator({
  setValue = () => {},
  error = [],
  register,
  fieldName,
  control,
  clearErrors,
  voteType,
} = {}) {
  const tabOption = useWatch({ control, name: 'tabOption' });

  // tabOption value is saved on form
  const setTab = (option) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    setValue('tabOption', option);
  };

  if (voteType === 'ranked-choice') {
    setTab('text-based');
  }

  return (
    <>
      {voteType === 'single-choice' ? (
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
      ) : null}
      {tabOption === 'text-based' && (
        <TextBasedChoices
          error={error}
          register={register}
          fieldName={fieldName}
          control={control}
          clearErrors={clearErrors}
        />
      )}
      {tabOption === 'visual' && (
        <ImageChoices control={control} error={error} />
      )}
    </>
  );
}
