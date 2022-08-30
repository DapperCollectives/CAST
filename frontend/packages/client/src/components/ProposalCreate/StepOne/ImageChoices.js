import React from 'react';
import ImageChoiceUploader from './ImageChoiceUploader';

const ImageChoices = ({ choices = [], onChoiceChange, error } = {}) => {
  const [errorOptOne, errorOptTwo] = Array.isArray(error) ? error : [];

  const onImageUpdate = (index) => (image) => {
    onChoiceChange(index, { value: image.text, choiceImgUrl: image.imageUrl });
  };

  console.log('cjoices', choices);
  const [choiceA, choiceB] = choices;
  return (
    <>
      <div className="columns flex-1">
        <div className="column pt-4">
          <p className="smaller-text has-text-gray">
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
