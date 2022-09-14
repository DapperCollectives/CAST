import React, { useCallback } from 'react';
import { useState } from 'react';
import Cropper from 'react-easy-crop';
import { ActionButton } from 'components';

export default function ImageCropperModal({
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
      className="modal-card has-background-white m-0 p-0 p-1-mobile full-height"
      style={{ minHeight: '610px', maxWidth: '400px' }}
    >
      <header
        className="modal-card-head has-background-white columns is-mobile m-0 px-4 pt-4"
        style={{ borderBottom: 'none' }}
      >
        <div className="column p-0 is-flex flex-1">
          <h2 className="medium-text">Edit Image</h2>
        </div>
        <div
          className={`column is-narrow px-0 has-text-right is-size-2 leading-tight cursor-pointer`}
          onClick={resizeOnDismiss}
        >
          &times;
        </div>
      </header>
      <section className="modal-card-body p-0" style={{ minHeight: '540px' }}>
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
        <div style={{ minHeight: '100px', position: 'relative' }}>
          <div className="columns is-multiline p-0 m-0 ">
            <div className="column is-12 p-0 m-0 ">
              <di>
                <p> Zoom</p>
              </di>
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                defaultValue="1"
                value={zoom}
                onChange={(e) => {
                  setZoom(e.target.value);
                }}
              />
            </div>
            <div className="column is-flex is-12 is-align-iterms-center is-justify-content-center">
              <div className="column is-10">
                <ActionButton
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
