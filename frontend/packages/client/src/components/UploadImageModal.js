import React, { useCallback, useState, useEffect, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { useFileUploader } from "../hooks";
import { Upload, Bin } from "../components/Svg";
import { Loader } from "../components";

const IMAGE_STATUS = {
  notStarted: "not-started",
  uploading: "uploading",
  uploaded: "uploaded",
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

  const fileName = image?.name ?? image.file.name;
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
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "cover",
              width: "32px",
              height: "32px",
              borderRadius: "8px",
            }}
          />
        )}
        {loading && (
          <div
            className="is-flex flex-1 is-flex-direction-column is-align-items-center is-justify-content-center"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
            }}
          >
            <Loader size={10} spacing="mx-loader" />
          </div>
        )}
      </div>
      <div className="column is-flex is-align-items-center p-2 is-9">
        <p className="smaller-text has-text-grey">{reducedFileName}</p>
      </div>
      <div className="column column is-flex is-align-items-center pr-0 py-2 pl-3 is-1">
        <div className="cursor-pointer" onClick={() => deleteImage(imageKey)}>
          <Bin />
        </div>
      </div>
    </>
  );
}

const UploadArea = ({ getRootProps, getInputProps, enableUpload }) => {
  return (
    <div
      className={`is-flex is-flex-direction-column is-align-items-center is-justify-content-center ${
        enableUpload ? "cursor-pointer" : ""
      }`}
      style={{
        borderRadius: "8px",
        border: "1px dashed #757575",
        overflow: "hidden",
        position: "relative",
        height: "100%",
        width: "100%",
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
          <span className="smaller-text pt-3 pb-1">Up to 4 images</span>
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
}) {
  const MAX_IMAGE_FILES = 4;
  const [images, setImages] = useState([]);
  const [captionValue, setCaptionValue] = useState("");

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
      onDone(images, captionValue);
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
      acceptedFiles.forEach((imageFile) => {
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
    [setImages]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    maxFiles: MAX_IMAGE_FILES,
    accept: "image/jpeg,image/png,image/gif",
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
        style={{ height: "570px" }}
      >
        <header
          className="modal-card-head has-background-white columns is-mobile p-4 m-0"
          style={{ borderBottom: "none" }}
        >
          <div className="column px-0 is-flex flex-1 ">
            <h2 className="is-size-4">Upload Images</h2>
          </div>
          <div
            className={`column is-narrow px-0 has-text-right is-size-2 leading-tight cursor-pointer ${
              isCancelling && "has-text-grey"
            }`}
            onClick={_onDismiss}
          >
            &times;
          </div>
        </header>
        <section className="modal-card-body" style={{ minHeight: "280px" }}>
          <div
            className="is-flex is-flex-direction-column flex-1"
            style={{ height: "100%" }}
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
                <div className="column py-0 pl-0 is-6">
                  <UploadArea
                    getRootProps={getRootProps}
                    getInputProps={getInputProps}
                    enableUpload={images.length < MAX_IMAGE_FILES}
                  />
                </div>
                <div className="column pt-0 is-6">
                  <p className="has-text-weight-bold pb-5">Uploaded files</p>
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
            <input
              type="text"
              placeholder="Caption"
              value={captionValue}
              className="border-light rounded-sm p-3 column is-full pr-6"
              onChange={(e) => setCaptionValue(e.target.value)}
              autoFocus
            />
          </div>
        </section>
        <footer
          className="modal-card-foot has-background-white pb-0 pt-1 px-4"
          style={{ borderTop: "none" }}
        >
          <div className="columns is-flex p-0 m-0 flex-1 is-justify-content-end">
            <button
              className={`button column is-12 transition-all has-background-yellow rounded-sm m-0 p-0 is-uppercase ${
                !enableDone && "is-disabled"
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
