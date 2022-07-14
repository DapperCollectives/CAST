import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'components/Svg';
import { WrapperResponsive, Loader } from 'components';
import { getReducedImg } from 'utils';
import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { MAX_FILE_SIZE } from 'const';

function CommunityEditorProfile({
  name,
  body = '',
  logo,
  // fn to update community payload
  updateCommunity,
  // fn to upload image
  uploadFile,
} = {}) {
  const [communityName, setCommunityName] = useState(name);
  const [communityDescription, setCommunityDescription] = useState(body);
  const [isUpdating, setIsUpdating] = useState('');
  const [enableSave, setEnableSave] = useState(false);
  const [image, setImage] = useState({ imageUrl: logo });
  const { notifyError } = useErrorHandlerContext();

  useEffect(() => {
    if (
      (communityName !== name && communityName.length > 0) ||
      communityDescription !== body ||
      image.file
    ) {
      setEnableSave(true);
    }
    if (
      communityName.trim().length === 0 ||
      (communityName === name &&
        communityDescription === body &&
        image.file === undefined)
    ) {
      setEnableSave(false);
    }
  }, [name, body, communityName, communityDescription, image]);

  const saveData = async () => {
    setIsUpdating(true);
    let newImageUrl;
    // upload image if any
    if (image.file) {
      newImageUrl = await uploadFile(image.file);
    }
    const updates = {
      ...(communityName !== name ? { name: communityName.trim() } : undefined),
      ...(communityDescription !== body
        ? { body: communityDescription.trim() }
        : undefined),
      ...(newImageUrl?.fileUrl ? { logo: newImageUrl.fileUrl } : undefined),
    };
    // updated fields
    if (Object.keys(updates).length > 0) await updateCommunity(updates);
    setIsUpdating(false);
    setEnableSave(false);
  };

  const onDrop = useCallback(
    (acceptedFiles) => {
      acceptedFiles.forEach((imageFile) => {
        // validate type
        if (
          !['image/png', 'image/jpeg', 'image/jpg'].includes(imageFile.type)
        ) {
          notifyError({
            status: 'Image Type not supported',
            statusText: 'Please upload a .png or .jpeg file type extension',
          });
          return;
        }
        // validate size
        if (imageFile.size > MAX_FILE_SIZE) {
          notifyError({
            status: 'Image file size not allowed',
            statusText: 'The selected file exceeds the 5MB limit.',
          });
          return;
        }
        const imageAsURL = URL.createObjectURL(imageFile);

        const img = new Image();
        img.onload = function (e) {
          // reduce image if necessary before upload
          if (e.target.width > 150) {
            getReducedImg(e.target, 150, 'community_image').then((result) => {
              setImage({ imageUrl: imageAsURL, file: result.imageFile });
            });
          } else {
            setImage({ imageUrl: imageAsURL, file: imageFile });
          }
        };
        img.src = imageAsURL;
      });
    },
    [setImage, notifyError]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: 'image/jpeg,image/png',
  });

  return (
    <WrapperResponsive
      classNames="border-light rounded-lg columns is-flex-direction-column is-mobile m-0"
      extraClasses="p-6 mb-6"
      extraClassesMobile="p-4 mb-4"
    >
      <div className="columns flex-1">
        <div className="column">
          <div className="is-flex flex-1">
            <WrapperResponsive
              tag="h5"
              classNames="title is-6 mb-2"
              extraClassesMobile="mt-4"
            >
              Community Profile
            </WrapperResponsive>
          </div>
          <div className="is-flex flex-1 mt-5">
            <p className="has-text-grey small-text">
              These details are publicly visible and will help people know what
              your community is all about.
            </p>
          </div>
        </div>
        <div className="column is-narrow">
          <div
            className="is-flex is-flex-direction-column is-align-items-center is-justify-content-center cursor-pointer"
            style={{
              borderRadius: '50px',
              height: '90px',
              width: '90px',
              overflow: 'hidden',
              position: 'relative',
              ...(!image?.imageUrl
                ? { border: '1px dashed #757575' }
                : undefined),
            }}
            {...getRootProps()}
          >
            {!image && !isUpdating && (
              <>
                <Upload />
                <span className="smaller-text">Avatar</span>
                <input {...getInputProps()} />
              </>
            )}
            {image?.imageUrl && (
              <div
                className="is-flex flex-1 is-flex-direction-column is-align-items-center is-justify-content-center"
                style={{
                  backgroundImage: `url(${image.imageUrl})`,
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: 'cover',
                  width: '100%',
                  opacity: 0.5,
                }}
              />
            )}
            {!(isUpdating && image.file) ? (
              <div
                className="is-flex is-flex-direction-column is-align-items-center is-justify-content-center"
                style={{
                  borderRadius: '50px',
                  height: '40px',
                  width: '40px',
                  position: 'absolute',
                  backgroundColor: '#4a4a4a',
                }}
              >
                <Upload className="has-text-white" />
                <input {...getInputProps()} />
              </div>
            ) : (
              <div
                className="is-flex is-flex-direction-column is-align-items-center is-justify-content-center"
                style={{
                  position: 'absolute',
                }}
              >
                <p className="is-size-7">Uploading...</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <input
        type="text"
        name="community_name"
        className="rounded-sm border-light p-3 column is-full mt-2"
        value={communityName}
        onChange={(event) => setCommunityName(event.target.value)}
        disabled={isUpdating}
      />
      <textarea
        className="text-area rounded-sm border-light p-3 column is-full mt-5"
        type="text"
        value={communityDescription}
        name="community_details"
        rows="3"
        cols="30"
        onChange={(event) => setCommunityDescription(event.target.value)}
        disabled={isUpdating}
      />
      <button
        style={{ height: 48, width: '100%' }}
        className={`button vote-button transition-all is-flex has-background-yellow rounded-sm mt-5 is-uppercase is-${
          enableSave && !isUpdating ? 'enabled' : 'disabled'
        }`}
        onClick={!enableSave ? () => {} : saveData}
      >
        {!isUpdating && <>Save</>}
        {isUpdating && <Loader size={18} spacing="mx-button-loader" />}
      </button>
    </WrapperResponsive>
  );
}

export default CommunityEditorProfile;
