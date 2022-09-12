import React, { useRef } from 'react';
import { useState } from 'react';
import AvatarEditor from 'react-avatar-editor';

// using https://www.npmjs.com/package/react-avatar-editor

export default function ImageCropModal({ logoImage, onDone, onDismiss } = {}) {
  const [scale, setScale] = useState(1);
  const [allowZoomOut, setAllowZoomOut] = useState(false);
  const [borderRadius, setBorderRadius] = useState(0);
  const editorRef = useRef();
  console.log(borderRadius);
  console.log(250 / (100 / borderRadius));

  const handleSave = () => {
    const img = editorRef.current?.getImageScaledToCanvas().toDataURL();
    const rect = editorRef.current?.getCroppingRect();

    fetch(img)
      .then((res) => res.blob())
      .then((blob) => {
        onDone({
          imageBlob: blob,
          imageUrl: window.URL.createObjectURL(blob),
          rect,
          scale: scale,
          width: 250,
          height: 250,
          borderRadius: borderRadius,
        });
      });

    if (!img || !rect) return;
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
          <AvatarEditor
            ref={editorRef}
            image={logoImage.imageUrl}
            width={250}
            height={250}
            border={50}
            borderRadius={250 / (100 / borderRadius)}
            backgroundColor="#00000052"
            color={[255, 255, 255, 0.6]} // RGBA
            scale={scale}
            rotate={0}
          />
        </div>
        <div className="columns is-multiline">
          <div className="column is-12">
            <di>
              <p> Zoom</p>
            </di>
            <input
              type="range"
              min={allowZoomOut ? '0.1' : '1'}
              max="2"
              defaultValue="1"
              value={scale}
              step="0.01"
              onChange={(e) => {
                setScale(e.target.value);
              }}
            />
          </div>
          <div className="column is-12">
            {'Allow Scale < 1'}
            <input
              name="allowZoomOut"
              type="checkbox"
              onChange={() => setAllowZoomOut((allowZoomOut) => !allowZoomOut)}
              checked={allowZoomOut}
            />
          </div>
          <div className="column is-12">
            <p>Border radius:</p>
            <input
              name="scale"
              type="range"
              onChange={(e) => setBorderRadius(e.target.value)}
              value={borderRadius}
              min="0"
              max="50"
              step="1"
              defaultValue="0"
            />
          </div>
          <div className="column is-12">
            <button onClick={handleSave}>done</button>
          </div>
        </div>
      </section>
    </div>
  );
}
