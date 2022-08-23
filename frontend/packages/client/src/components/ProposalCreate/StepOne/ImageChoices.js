import React, { useEffect } from 'react';
import { getProposalType } from 'utils';
import ImageChoiceUploader from './ImageChoiceUploader';

const ImageChoices = ({ choices = [], onChoiceChange, initChoices } = {}) => {
  useEffect(() => {
    if (getProposalType(choices) !== 'image') {
      initChoices([
        {
          value: '',
          choiceImgUrl: '',
        },
        {
          value: '',
          choiceImgUrl: '',
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onImageUpdate = (index) => (image) => {
    onChoiceChange({ value: image.text, choiceImgUrl: image.imageUrl }, index);
  };

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
          />
        </div>
      </div>
    </>
  );
};
export default ImageChoices;
