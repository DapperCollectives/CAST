import React from 'react';
import { Image } from 'components/Svg';

export default function ImageOption({ addImage = () => {} } = {}) {
  return (
    <>
      <div
        className="rdw-image-wrapper"
        aria-haspopup="true"
        aria-label="rdw-image-control"
        aria-expanded="false"
        onClick={() => addImage()}
      >
        <div className="rdw-option-wrapper" title="Image">
          <Image />
        </div>
      </div>
    </>
  );
}
