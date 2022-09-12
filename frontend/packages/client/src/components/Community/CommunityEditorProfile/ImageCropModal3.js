import React, { useCallback, useEffect, useRef } from 'react';
import { useState } from 'react';
import Cropper from 'react-easy-crop';
import { config } from '@onflow/sdk';
import { clearConfigCache } from 'prettier';

// using https://www.npmjs.com/package/react-avatar-editor

export default function ImageCropModal({ logoImage, onDone, onDismiss } = {}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [image, setImage] = useState(null);
  const [croppedArea, setCroppedArea] = useState();
  const [zoom, setZoom] = useState(1);
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    console.log(croppedArea, croppedAreaPixels);
  }, []);

  console.log('crop has ', crop);
  const getCroppedImg = (sourceImage, crop, fileName) => {
    const canvas = document.createElement('canvas');
    const scaleX = sourceImage.naturalWidth / sourceImage.width;
    const scaleY = sourceImage.naturalHeight / sourceImage.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(
      sourceImage,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );
    try {
      return new Promise((resolve) => {
        canvas.toBlob((file) => {
          resolve({ file, imageUrl: URL.createObjectURL(file) });
        }, 'image/jpeg');
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  const imageRef = useRef(null);

  useEffect(() => {
    if (imageRef.current) {
      setImage(imageRef.current);
    }
  }, [imageRef]);

  const handleResize = async () => {
    console.log('image is', image);
    const result = await getCroppedImg(image, croppedArea, 'ddd');
    console.log('result from cropt', result);
  };
  return (
    <div
      className="modal-card has-background-white m-0 p-5 p-1-mobile full-height"
      style={{ minHeight: '640px' }}
    >
      <header
        className="modal-card-head has-background-white columns is-mobile m-0 px-4 pt-4"
        style={{ borderBottom: 'none' }}
      >
        <div className="column p-0 is-flex flex-1">
          <h2 className="is-size-4" style={{ textTransform: 'capitalize' }}>
            Crop the image - test
          </h2>
        </div>
        <div
          className={`column is-narrow px-0 has-text-right is-size-2 leading-tight cursor-pointer`}
          onClick={onDismiss}
        >
          &times;
        </div>
      </header>
      <section
        className="modal-card-body py-0 px-4"
        style={{ minHeight: '480px' }}
      >
        <div
          style={{
            maxHeight: '300px',
            position: 'absolute',
            top: '30%',
            left: 0,
            right: 0,
            bottom: '30px',
          }}
        >
          <Cropper
            image={logoImage.imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            cropShape="round"
            showGrid={false}
          />
          <image src={logoImage.imageUrl} ref={imageRef} alt="" />
        </div>
        <div
          style={{
            maxHeight: '220px',
            position: 'absolute',
            top: '80%',
            left: '30%',
            right: 0,
            bottom: '80px',
          }}
        >
          <div className="columns is-multiline">
            <div className="column is-12">
              <di>
                <p> Zoom</p>
              </di>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                defaultValue="1"
                value={zoom}
                onChange={(e) => {
                  setZoom(e.target.value);
                }}
              />
            </div>
            <div className="column is-12">
              <div className="column is-12">
                <button onClick={handleResize}>done</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
