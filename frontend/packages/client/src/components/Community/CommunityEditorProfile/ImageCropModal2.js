import React, { useEffect, useRef } from 'react';
import { useState } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// using https://www.npmjs.com/package/react-image-crop

export default function ImageCropModal({ logoImage, onDone, onDismiss } = {}) {
  const [image, setImage] = useState(logoImage.imageUrl);
  const [crop, setCrop] = useState({
    unit: '%',
    width: 30,
    aspect: 16 / 9,
    height: 30,
  });
  const imageRef = useRef(null);

  useEffect(() => {
    if (imageRef.current) {
      setImage(imageRef.current);
    }
  }, [imageRef]);

  const [croppedImageUrl, setCroppedImageUrl] = useState('');

  const makeClientCrop = async (crop) => {
    if ((image, crop.width && crop.height)) {
      const croppedImg = await getCroppedImg(image, crop, 'newFile.jpeg');
      setCroppedImageUrl(croppedImg);
    }
  };

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

  const handleSave = () => {
    if (croppedImageUrl !== '') {
      onDone({
        imageBlob: croppedImageUrl.file,
        imageUrl: croppedImageUrl.imageUrl,
      });
    }
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
        style={{ minHeight: '280px' }}
      >
        <div className="is-flex is-justify-content-center">
          <ReactCrop
            crop={crop}
            ruleOfThirds
            onComplete={(crop) =>
              image ? makeClientCrop(crop) : console.log('wait')
            }
            onChange={(cropData) => setCrop(cropData)}
          >
            <img src={logoImage.imageUrl} ref={imageRef} alt="" />
          </ReactCrop>
        </div>
        <div className="column is-12">
          <button onClick={handleSave}>done</button>
        </div>
      </section>
    </div>
  );
}
