import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { Loader } from 'components';
import { Upload, Bin } from 'components/Svg';
import { MAX_PROPOSAL_IMAGE_FILE_SIZE } from 'const';
import { useFileUploader, useMediaQuery } from 'hooks';

const MAX_IMAGE_FILES = 1;

const IMAGE_STATUS = {
  notStarted: 'not-started',
  uploading: 'uploading',
  uploaded: 'uploaded',
};

function ImageUploader({
  image,
  imageKey,
  onUploaded,
  deleteImage,
  onUploadStared,
}) {
  const { uploadFile, loading, error } = useFileUploader({
    useModalNotifications: false,
  });
  useEffect(() => {
    async function upload(img) {
      return uploadFile(img.file);
    }
    // image?.uploadStatus indicates upload did not started,
    // then start upload and update status
    if (image?.uploadStatus === IMAGE_STATUS.notStarted && !loading) {
      onUploadStared(imageKey);
      upload(image).then((uploaded) => {
        if (error) {
          // delete image if upload failed
          deleteImage(imageKey);
          return;
        }
        onUploaded(uploaded, imageKey);
      });
    }
  }, [
    image,
    onUploaded,
    loading,
    error,
    imageKey,
    onUploadStared,
    deleteImage,
    uploadFile,
  ]);

  const fileName = image?.name ?? image?.file.name;

  const reducedFileName =
    fileName.length > 20 ? `${fileName.slice(0, 25)}...` : fileName;
  return (
    <>
      <div className="column is-2 pl-0 py-2 pr-2 is-narrow">
        {!loading && (
          <div
            className="is-flex flex-1 is-flex-direction-column is-align-items-center is-justify-content-center"
            style={{
              backgroundImage: `url(${image.imageUrl})`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              backgroundSize: 'cover',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
            }}
          />
        )}
        {loading && (
          <div
            className="is-flex flex-1 is-flex-direction-column is-align-items-center is-justify-content-center"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
            }}
          >
            <Loader size={10} spacing="mx-loader" />
          </div>
        )}
      </div>
      <div className="column is-flex is-align-items-center p-2 is-9">
        <p className="smaller-text has-text-grey">{reducedFileName}</p>
      </div>
      <div className="column column is-flex is-align-items-center is-justify-content-flex-end p-0 is-1">
        <div className="cursor-pointer" onClick={() => deleteImage(imageKey)}>
          <Bin />
        </div>
      </div>
    </>
  );
}

const UploadArea = ({ getRootProps, getInputProps, enableUpload }) => {
  const notMobile = useMediaQuery();
  return (
    <div
      className={`is-flex is-flex-direction-column is-align-items-center is-justify-content-center ${
        enableUpload ? 'cursor-pointer' : ''
      }`}
      style={{
        borderRadius: '8px',
        border: '1px dashed #757575',
        overflow: 'hidden',
        position: 'relative',
        height: '100%',
        width: '100%',
        ...(!notMobile ? { minHeight: '150px' } : {}),
      }}
      disabled={enableUpload}
      {...(enableUpload ? getRootProps() : undefined)}
    >
      {enableUpload && (
        <div className="is-flex is-flex-direction-column is-align-items-center is-justify-content-center">
          <Upload width="36" height="30" />
          <span className="smaller-text pt-3 pb-1">Drag and drop here </span>
          <span className="smaller-text py-1"> or </span>
          <span className="smaller-text py-1">
            <b>Browse files</b>
          </span>
          <input {...getInputProps()} />
        </div>
      )}
      {!enableUpload && (
        <div className="is-flex is-flex-direction-column is-align-items-center is-justify-content-center">
          <span className="smaller-text pt-3 pb-1">Click on Done</span>
        </div>
      )}
    </div>
  );
};
export default function UploadImageModal({
  onDismiss,
  isCancelling = false,
  onDone,
  maxImageFiles = MAX_IMAGE_FILES,
}) {
  const [images, setImages] = useState([]);
  // when more than one image is added this will be an array mapping the images array
  const [captionValues, setCaptionValues] = useState(['']);

  const [errorMessage, setErrorMessage] = useState(null);
  const _onDismiss = () => {
    onDismiss();
  };

  const enableDone = useMemo(
    () =>
      images.every((img) => img.uploadStatus === IMAGE_STATUS.uploaded) &&
      images.length > 0,
    [images]
  );
  const _onDone = () => {
    if (enableDone) {
      onDone(images, captionValues);
    }
  };

  const deleteImage = useCallback(
    (index) => {
      const imageArray = images.filter((img, i) => i !== index);
      setImages(imageArray);
    },
    [images, setImages]
  );

  const onDrop = useCallback(
    (acceptedFiles) => {
      // clean previous error message
      if (errorMessage) {
        setErrorMessage(null);
      }
      acceptedFiles.forEach((imageFile) => {
        if (imageFile.size > MAX_PROPOSAL_IMAGE_FILE_SIZE) {
          setErrorMessage('The selected file exceeds the 2MB limit.');
          return;
        }
        const imageAsURL = URL.createObjectURL(imageFile);

        const img = new Image();
        img.onload = function (e) {
          setImages((state) => [
            ...state,
            {
              imageUrl: imageAsURL,
              file: imageFile,
              uploadStatus: IMAGE_STATUS.notStarted,
            },
          ]);
        };
        img.src = imageAsURL;
      });
    },
    [setImages, errorMessage, setErrorMessage]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    maxFiles: maxImageFiles,
    accept: 'image/jpeg,image/png,image/gif',
  });

  const onUploadStared = useCallback(
    (imageKey) => {
      setImages((images) => {
        return images.map((img, i) => {
          if (i === imageKey) {
            return {
              ...img,
              uploadStatus: IMAGE_STATUS.uploading,
            };
          }
          return img;
        });
      });
    },
    [setImages]
  );

  const imageUploadComplete = useCallback((uploaded, imageKey) => {
    if (!uploaded) {
      setImages((images) => images.filter((img, i) => i !== imageKey));
      return;
    }
    setImages((images) => {
      return images.map((img, i) => {
        if (i === imageKey) {
          return {
            imageUrl: uploaded.fileUrl,
            uploadStatus: IMAGE_STATUS.uploaded,
            name: img.file.name,
          };
        }
        return img;
      });
    });
  }, []);
  return (
    <div className="modal is-active">
      <div className="modal-background"></div>
      <div
        className="modal-card rounded-sm has-background-white m-0 p-5"
        style={{ height: '570px' }}
      >
        <header
          className="modal-card-head has-background-white columns is-mobile p-4 m-0"
          style={{ borderBottom: 'none' }}
        >
          <div className="column px-0 is-flex flex-1 ">
            <h2 className="is-size-4">Upload Image</h2>
          </div>
          <div
            className={`column is-narrow px-0 has-text-right is-size-2 leading-tight cursor-pointer ${
              isCancelling && 'has-text-grey'
            }`}
            onClick={_onDismiss}
          >
            &times;
          </div>
        </header>
        <section className="modal-card-body" style={{ minHeight: '280px' }}>
          <div
            className="is-flex is-flex-direction-column flex-1"
            style={{ height: '100%' }}
          >
            {images.length === 0 && (
              <UploadArea
                getRootProps={getRootProps}
                getInputProps={getInputProps}
                enableUpload={images.length < MAX_IMAGE_FILES}
              />
            )}
            {images.length > 0 && (
              <div className="columns m-0 p-0 flex-1">
                <div className="column py-0 pl-0 pr-0-mobile is-6 mb-4-mobile">
                  <UploadArea
                    getRootProps={getRootProps}
                    getInputProps={getInputProps}
                    enableUpload={images.length < MAX_IMAGE_FILES}
                  />
                </div>
                <div className="column pt-0 pr-0 p-0-mobile is-6">
                  <p className="has-text-weight-bold pb-5 pb-2-mobile">
                    Uploaded file
                  </p>
                  <div className="columns is-multiline m-0 is-mobile">
                    {images.map((image, i) => {
                      return (
                        <ImageUploader
                          image={image}
                          imageKey={i}
                          onUploaded={imageUploadComplete}
                          key={i}
                          deleteImage={deleteImage}
                          onUploadStared={onUploadStared}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            <div className="py-4">
              <p className="smaller-text has-text-gray">
                Accepted files: PNG, JPG, GIF
              </p>
            </div>
            {errorMessage && (
              <div className="pb-4 transition-all">
                <p className="smaller-text has-text-red">{errorMessage}</p>
              </div>
            )}
            {/* For now this is a single input */}
            <input
              type="text"
              placeholder="Caption"
              value={captionValues[0]}
              className="border-light rounded-sm p-3 column is-full pr-6"
              onChange={(e) => setCaptionValues([`${e.target.value}`])}
              autoFocus
              style={{ maxHeight: '42px' }}
            />
          </div>
        </section>
        <footer
          className="modal-card-foot has-background-white pb-0 pt-1 px-4"
          style={{ borderTop: 'none' }}
        >
          <div className="columns is-flex p-0 m-0 flex-1 is-justify-content-end">
            <button
              className={`button column is-12 transition-all has-background-yellow rounded-sm m-0 p-0 is-uppercase ${
                !enableDone && 'is-disabled'
              }`}
              onClick={_onDone}
            >
              Done
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
