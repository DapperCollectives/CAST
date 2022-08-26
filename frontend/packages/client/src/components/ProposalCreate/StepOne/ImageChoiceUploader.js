import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Loader } from 'components';
import { Bin, Upload } from 'components/Svg';
import { useFileUploader } from 'hooks';
import { MAX_FILE_SIZE } from 'const';

const IMAGE_STATUS = {
  notStarted: 'not-started',
  uploading: 'uploading',
  uploaded: 'uploaded',
  deleted: 'deleted',
  toBeDeleted: 'to-be-deleted',
};

const UploadArea = ({ getRootProps, getInputProps, errorMessage }) => {
  return (
    <>
      <div
        className={`is-flex is-flex-direction-column is-align-items-center is-justify-content-center cursor-pointer`}
        style={{
          borderRadius: '8px',
          border: '1px dashed #757575',
          overflow: 'hidden',
          position: 'relative',
          height: '215px',
          width: '100%',
        }}
        {...getRootProps()}
      >
        <div className="is-flex is-flex-direction-column is-align-items-center is-justify-content-center">
          <Upload width="36" height="30" />
          <span className="smaller-text pt-3 pb-1">Drag and drop here </span>
          <span className="smaller-text py-1"> or </span>
          <span className="smaller-text py-1">
            <b>Browse files</b>
          </span>

          <input {...getInputProps()} />
        </div>
      </div>
      {errorMessage && (
        <p className="small-text pt-2 has-text-red">* {errorMessage}</p>
      )}
    </>
  );
};

// initial state when no image has been uploaded
const initialState = {
  imageUrl: null,
  uploadStatus: null,
  file: null,
  text: '',
};

export default function ImageChoiceUploader({
  onImageUpdate,
  image: imageParam,
  letterLabel,
  error: errorParam,
} = {}) {
  const [errorMessage, setErrorMessage] = useState(null);
  // existing image and component receives props
  const { imageUrl, text } = imageParam;
  const existingImage = {
    imageUrl,
    uploadStatus: IMAGE_STATUS.uploaded,
    file: null,
    text,
  };

  const [image, setImage] = useState(
    imageParam.imageUrl === '' ? initialState : existingImage
  );

  const { uploadFile, loading, error } = useFileUploader({
    useModalNotifications: false,
  });

  const onDeleteImage = () => {
    setImage((state) => ({
      ...initialState,
      uploadStatus: IMAGE_STATUS.toBeDeleted,
      text: state.text,
    }));
  };

  useEffect(() => {
    // image upload completed
    // setting file to null to cut loop
    if (image.uploadStatus === IMAGE_STATUS.uploaded && image.file) {
      setImage((state) => ({
        ...state,
        file: null,
      }));
      onImageUpdate(image);
    }
    // image deleted by user
    if (
      image.imageUrl === null &&
      image.uploadStatus === IMAGE_STATUS.toBeDeleted
    ) {
      setImage((state) => ({
        ...state,
        uploadStatus: IMAGE_STATUS.deleted,
      }));
      onImageUpdate({
        ...image,
        imageUrl: '',
      });
    }
    if (image.text !== imageParam?.text) {
      onImageUpdate(image);
    }
  }, [image, onImageUpdate, imageParam?.text]);

  useEffect(() => {
    async function upload(img) {
      return uploadFile(img.file);
    }
    // image?.uploadStatus === IMAGE_STATUS.notStarted indicates upload did not started,
    // then start upload and update status to IMAGE_STATUS.uploading
    if (image?.uploadStatus === IMAGE_STATUS.notStarted && !loading) {
      setImage((state) => ({
        ...state,
        uploadStatus: IMAGE_STATUS.uploading,
      }));
      upload(image).then((uploaded) => {
        if (error) {
          // delete image if upload failed, but keep text
          setImage((state) => ({
            ...initialState,
            text: state.text,
          }));
          return;
        }
        setImage((state) => ({
          ...state,
          imageUrl: uploaded.fileUrl,
          uploadStatus: IMAGE_STATUS.uploaded,
        }));
      });
    }
  }, [image, loading, error, uploadFile]);

  const onDrop = useCallback(
    (acceptedFiles) => {
      acceptedFiles.forEach((imageFile) => {
        setErrorMessage(null);
        if (imageFile.size > MAX_FILE_SIZE) {
          setErrorMessage('The selected file exceeds the 5MB limit.');
          return;
        }
        const imageAsURL = URL.createObjectURL(imageFile);

        const img = new Image();

        img.onload = function (e) {
          const { target } = e;
          const maxDim =
            target.naturalWidth > target.naturalHeight ? 'width' : 'height';
          setImage((state) => ({
            ...state,
            imageUrl: imageAsURL,
            file: imageFile,
            uploadStatus: IMAGE_STATUS.notStarted,
            maxDim,
          }));
        };
        img.src = imageAsURL;
      });
    },
    [setImage]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: 'image/jpeg,image/png,image/gif',
    useFsAccessApi: false,
  });

  return (
    <div>
      {!image.imageUrl && (
        <UploadArea
          getRootProps={getRootProps}
          getInputProps={getInputProps}
          errorMessage={errorMessage}
        />
      )}
      {(image?.uploadStatus === IMAGE_STATUS.notStarted ||
        image?.uploadStatus === IMAGE_STATUS.uploading) && (
        <div
          className="is-flex is-flex-direction-column is-align-items-center is-justify-content-center"
          style={{
            borderRadius: '8px',
            border: '1px dashed #757575',
            overflow: 'hidden',
            position: 'relative',
            height: '215px',
            width: '100%',
          }}
        >
          <Loader size={18} className="mb-3" spacing="mx-button-loader" />
          <p>Uploading...</p>
        </div>
      )}
      {image?.uploadStatus === IMAGE_STATUS.uploaded && (
        <div
          className="is-flex flex-1 is-flex-direction-column is-align-items-flex-end is-justify-content-flex-start"
          style={{
            backgroundImage: `url(${image.imageUrl})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'contain',
            borderRadius: '8px',
            height: '445px',
          }}
        >
          <div
            className="has-background-white rounded-sm cursor-pointer"
            style={{
              position: 'relative',
              marginTop: '16px',
              marginRight: '16px',
              paddingTop: '6px',
              paddingLeft: '8px',
              paddingRight: '8px',
              paddingBottom: '3px',
              borderStyle: 'solid',
              borderWidth: '1px',
              borderColor: '#ccc',
            }}
            onClick={onDeleteImage}
          >
            <Bin />
          </div>
        </div>
      )}
      <input
        type="text"
        name="image-text"
        placeholder={`VOTE FOR ${letterLabel}`}
        className="rounded-sm border-light mt-5 py-3 pr-3 column is-full mt-4"
        value={image?.text}
        maxLength={200}
        onChange={(event) =>
          setImage((state) => ({
            ...state,
            text: event.target.value,
          }))
        }
        style={{ width: '100%' }}
      />
    </div>
  );
}
