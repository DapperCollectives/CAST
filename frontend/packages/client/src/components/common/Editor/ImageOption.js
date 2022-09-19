import { Svg } from '@cast/shared-components';

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
          <Svg name="Image" />
        </div>
      </div>
    </>
  );
}
