import { useCallback } from 'react';
import { useState } from 'react';
import Cropper from 'react-easy-crop';
import { Svg } from '@cast/shared-components';
import { ActionButton } from 'components';
import Slider from './Slider';

export default function ImageCropModal({
  logoImage,
  onDone,
  cropShape,
  aspect = 1,
  cropperFn,
  defaultCropArea,
} = {}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [croppedArea, setCroppedArea] = useState({});
  const [zoom, setZoom] = useState(1);
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedArea({ croppedArea, croppedAreaPixels });
  }, []);

  const handleResize = async () => {
    const imageCropped = await cropperFn(
      logoImage.file,
      croppedArea.croppedAreaPixels
    );
    onDone(imageCropped);
  };

  const resizeOnDismiss = async () => {
    const imageCropped = await cropperFn(logoImage.file, defaultCropArea);
    onDone(imageCropped);
  };

  return (
    <div
      className="modal-card has-background-white m-0 p-0 full-height"
      style={{ minHeight: '610px', width: '100%' }}
    >
      <header
        className="modal-card-head has-background-white columns is-mobile m-0 px-5 pt-4"
        style={{ borderBottom: 'none', maxHeight: '80px' }}
      >
        <div className="column p-0 is-flex flex-1">
          <h2 className="medium-text has-text-weight-bold">Edit Image</h2>
        </div>
        <div
          className={`column is-narrow px-0 has-text-right is-size-2 leading-tight cursor-pointer`}
          onClick={resizeOnDismiss}
        >
          <Svg name="Close" height="18" width="18" />
        </div>
      </header>
      <section className="modal-card-body p-0" style={{ minHeight: '530px' }}>
        <div style={{ minHeight: '400px', position: 'relative' }}>
          <Cropper
            image={logoImage.imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            cropShape={cropShape}
            showGrid={false}
          />
        </div>
        <div
          className="is-flex flex-1 is-flex-direction-column is-justify-content-flex-start"
          style={{ minHeight: '130px', position: 'relative' }}
        >
          <div className="columns is-mobile is-justify-content-center is-multiline p-0 m-0 mt-1">
            <div
              className="column is-flex is-justify-content-center is-align-items-center is-8 p-0 m-0 mb-2"
              style={{ minHeight: '48px' }}
            >
              <Slider
                min={1}
                max={3}
                step={0.05}
                defaultValue="1"
                value={zoom}
                onChange={(value) => {
                  setZoom(value);
                }}
              />
            </div>
            <div className="column m-0 p-0 is-flex is-12 is-align-iterms-center is-justify-content-center">
              <div className="is-flex flex-1 px-5">
                <ActionButton
                  height={40}
                  classNames="has-text-weight-bold"
                  onClick={handleResize}
                  label="Done"
                  isUppercase={false}
                  roundedClass="rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
