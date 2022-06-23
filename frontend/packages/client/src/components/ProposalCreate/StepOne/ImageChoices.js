import React, { useEffect } from 'react';
import ImageChoiceUploader from './ImageChoiceUploader';
import { getProposalType } from '../../../utils';

const ImageChoices = ({ choices = [], onChoiceChange, initChoices } = {}) => {
  useEffect(() => {
    if (getProposalType(choices) !== 'image') {
      initChoices([
        {
          id: 1,
          value: '',
          choiceImgUrl: '',
        },
        {
          id: 2,
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
