import React, { useEffect } from 'react';
import { useFieldArray } from 'react-hook-form';
import ImageChoiceUploader from './ImageChoiceUploader';

const ImageChoices = ({ error, control } = {}) => {
  const [errorOptOne, errorOptTwo] = Array.isArray(error) ? error : [];

  const {
    fields: choices,
    update,
    append,
  } = useFieldArray({
    control,
    name: 'choices',
    focusAppend: true,
  });

  useEffect(() => {
    if (choices.length < 2) {
      const size = 2 - choices.length;
      const toAdd = new Array(size).fill({ value: '', choiceImgUrl: '' });
      append(toAdd);
    }
  }, [choices, append]);

  const onImageUpdate = (index) => (image) => {
    update(index, { value: image.text, choiceImgUrl: image.imageUrl });
  };

  const [choiceA, choiceB] = choices;
  return (
    <>
      <div className="columns flex-1">
        <div className="column pt-4">
          <p className="smaller-text has-text-grey">
            Accepted files: PNG, JPG, GIF
          </p>
        </div>
      </div>
      <div className="columns flex-1">
        <div className="column">
          <ImageChoiceUploader
            image={{
              imageUrl: choiceA?.choiceImgUrl ?? '',
              text: choiceA?.value ?? '',
            }}
            letterLabel="A"
            onImageUpdate={onImageUpdate(0)}
            error={errorOptOne}
          />
        </div>
        <div className="column">
          <ImageChoiceUploader
            image={{
              imageUrl: choiceB?.choiceImgUrl ?? '',
              text: choiceB?.value ?? '',
            }}
            letterLabel="B"
            onImageUpdate={onImageUpdate(1)}
            error={errorOptTwo}
          />
        </div>
      </div>
    </>
  );
};
export default ImageChoices;
