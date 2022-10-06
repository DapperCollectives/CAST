import { useEffect, useState } from 'react';
import { WrapperResponsive as Wrapper } from 'components';
import ButtonChoice from './ButtonChoice';

const ImageBasedOptions = ({
  choiceA,
  choiceB,
  currentOption,
  confirmAndVote,
  readOnly,
  previousVote,
}) => {
  const [imageA, setImageA] = useState(null);
  const [imageB, setImageB] = useState(null);

  // process image A
  useEffect(() => {
    if (!imageA) {
      const img = new Image();
      img.onload = function (event) {
        const { target } = event;
        const maxDim =
          target.naturalHeight > target.naturalWidth ? 'height' : 'width';

        setImageA({
          file: target,
          height: target.naturalHeight,
          width: target.naturalWidth,
          maxDim,
        });
      };
      img.src = choiceA.choiceImgUrl;
    }
  }, [choiceA, setImageA, imageA]);

  // process Image B
  useEffect(() => {
    if (!imageB) {
      const img = new Image();
      img.onload = function (event) {
        const { target } = event;
        const maxDim =
          target.naturalHeight > target.naturalWidth ? 'height' : 'width';

        setImageB({
          file: target,
          height: target.naturalHeight,
          width: target.naturalWidth,
          maxDim,
        });
      };
      img.src = choiceB.choiceImgUrl;
    }
  }, [choiceB, setImageB, imageB]);

  const styleHeight = { height: '500px' };
  const imageStyle = { maxHeight: '500px' };

  return (
    <div className="columns">
      <Wrapper
        classNames="column is-6 pt-0 is-flex is-flex-direction-column"
        extraClasses="pr-1"
        extraClassesMobile=""
      >
        <div
          className="is-flex flex-1 is-align-items-center is-justify-content-center"
          style={styleHeight}
        >
          {imageA && (
            <img
              src={imageA?.file.src}
              alt={choiceA.label}
              style={
                imageA?.maxDim === 'width' ? { width: '100%' } : imageStyle
              }
            />
          )}
        </div>
        <ButtonChoice
          choice={choiceA}
          currentOption={currentOption}
          readOnly={readOnly}
          confirmAndVote={confirmAndVote}
          previousVote={previousVote}
        />
      </Wrapper>
      <Wrapper
        classNames="column is-6 pt-0 is-flex is-flex-direction-column"
        extraClasses="pl-1"
        extraClassesMobile=""
      >
        <div
          className="is-flex flex-1 is-align-items-center is-justify-content-center"
          style={styleHeight}
        >
          {imageB && (
            <img
              src={imageB?.file.src}
              alt={choiceB.label}
              style={
                imageB?.maxDim === 'width' ? { width: '100%' } : imageStyle
              }
            />
          )}
        </div>
        <ButtonChoice
          choice={choiceB}
          currentOption={currentOption}
          readOnly={readOnly}
          confirmAndVote={confirmAndVote}
          previousVote={previousVote}
        />
      </Wrapper>
    </div>
  );
};

export default ImageBasedOptions;
