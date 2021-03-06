import React, { useState, useEffect, useCallback } from 'react';
import classnames from 'classnames';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'components/Svg';
import { WrapperResponsive, Loader } from 'components';
import { getReducedImg, validateLength } from 'utils';
import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import {
  MAX_AVATAR_FILE_SIZE,
  MAX_FILE_SIZE,
  COMMUNITY_DESCRIPTION_MAX_LENGTH,
  COMMUNITY_NAME_MAX_LENGTH,
} from 'const';

function CommunityEditorProfile({
  name,
  body = '',
  logo,
  banner,
  // fn to update community payload
  updateCommunity,
  // fn to upload image
  uploadFile,
} = {}) {
  const [communityName, setCommunityName] = useState(name);
  const [communityDescription, setCommunityDescription] = useState(body);
  const [isUpdating, setIsUpdating] = useState('');
  const [isUpdatingImage, setIsUpdatingImage] = useState(false);
  const [isUpdatingBanner, setIsUpdatingBanner] = useState(false);
  const [enableSave, setEnableSave] = useState(false);
  const [image, setImage] = useState({ imageUrl: logo });
  const [bannerImage, setBannerImage] = useState({ imageUrl: banner });
  const { notifyError } = useErrorHandlerContext();

  useEffect(() => {
    if (
      (communityName !== name &&
        communityName.length > 0 &&
        validateLength(communityName, COMMUNITY_NAME_MAX_LENGTH)) ||
      communityDescription !== body ||
      image.file ||
      bannerImage.file
    ) {
      setEnableSave(true);
    }
    if (
      communityName.trim().length === 0 ||
      (communityName === name &&
        communityDescription === body &&
        image.file === undefined &&
        bannerImage.file === undefined) ||
      !validateLength(communityName, COMMUNITY_NAME_MAX_LENGTH) ||
      !validateLength(communityDescription, COMMUNITY_DESCRIPTION_MAX_LENGTH)
    ) {
      setEnableSave(false);
    }
  }, [name, body, communityName, communityDescription, image, bannerImage]);

  const saveData = async () => {
    setIsUpdating(true);
    // upload images if any
    let newImageUrl;
    let newBannerImageUrl;
    if (image.file) {
      setIsUpdatingImage(true);
      newImageUrl = await uploadFile(image.file);
    }
    if (bannerImage.file) {
      setIsUpdatingBanner(true);
      newBannerImageUrl = await uploadFile(bannerImage.file);
    }
    const updates = {
      ...(communityName !== name ? { name: communityName.trim() } : undefined),
      ...(communityDescription !== body
        ? { body: communityDescription.trim() }
        : undefined),
      ...(newImageUrl?.fileUrl ? { logo: newImageUrl.fileUrl } : undefined),
      ...(newBannerImageUrl?.fileUrl
        ? { bannerImgUrl: newBannerImageUrl.fileUrl }
        : undefined),
    };
    // updated fields
    if (Object.keys(updates).length > 0) await updateCommunity(updates);
    setIsUpdating(false);
    setIsUpdatingImage(false);
    setIsUpdatingBanner(false);
    setEnableSave(false);
  };

  const onDrop = useCallback(
    (filename, dataKey, maxFileSize, maxWidth) => (acceptedFiles) => {
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
        if (imageFile.size > MAX_AVATAR_FILE_SIZE) {
          const sizeLimit =
            maxFileSize === MAX_AVATAR_FILE_SIZE ? '2MB' : '5MB';
          notifyError({
            status: 'Image file size not allowed',
            statusText: `The selected file exceeds the ${sizeLimit} limit.`,
          });
          return;
        }
        const imageAsURL = URL.createObjectURL(imageFile);
        const setters = {
          logo: setImage,
          banner: setBannerImage,
        };
        const img = new Image();
        img.onload = function (e) {
          // reduce images if necessary before upload
          if (e.target.width > maxWidth) {
            getReducedImg(e.target, maxWidth, filename).then((result) => {
              setters[dataKey]({
                imageUrl: imageAsURL,
                file: result.imageFile,
              });
            });
          } else {
            setters[dataKey]({ imageUrl: imageAsURL, file: imageFile });
          }
        };
        img.src = imageAsURL;
      });
    },
    [setImage, setBannerImage, notifyError]
  );

  const { getRootProps: getLogoRootProps, getInputProps: getLogoInputProps } =
    useDropzone({
      onDrop: onDrop('community_image', 'logo', MAX_AVATAR_FILE_SIZE, 150),
      maxFiles: 1,
      accept: 'image/jpeg,image/png',
    });

  const {
    getRootProps: getBannerRootProps,
    getInputProps: getBannerInputProps,
  } = useDropzone({
    onDrop: onDrop('community_banner', 'banner', MAX_FILE_SIZE, 1200),
    maxFiles: 1,
    accept: 'image/jpeg,image/png',
  });

  const imageDropClasses = classnames(
    'is-flex is-flex-direction-column is-align-items-center is-justify-content-center cursor-pointer rounded-lg',
    {
      'border-dashed-dark': !bannerImage.file && !bannerImage.imageUrl,
    }
  );

  const showNameInputError = !validateLength(
    communityName ?? '',
    COMMUNITY_NAME_MAX_LENGTH
  );
  const showDescriptionInputError = !validateLength(
    communityDescription ?? '',
    COMMUNITY_DESCRIPTION_MAX_LENGTH
  );
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
                ? { border: '2px dashed #757575' }
                : undefined),
            }}
            {...getLogoRootProps()}
          >
            {!isUpdatingImage && !image?.imageUrl && !image?.file && (
              <>
                <Upload />
                <span className="smaller-text">Avatar</span>
                <input {...getLogoInputProps()} />
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
            {!isUpdatingImage && (image?.imageUrl || image?.file) && (
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
                <input {...getLogoInputProps()} />
              </div>
            )}
            {isUpdatingImage && (
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
      <div className="columns">
        <div className="column is-12">
          <div
            className={imageDropClasses}
            style={{ minHeight: 200 }}
            {...getBannerRootProps()}
          >
            {!isUpdatingBanner && !bannerImage?.imageUrl && (
              <>
                <Upload />
                <span className="smaller-text">Community Banner Image</span>
                <span className="smaller-text">
                  JPG or PNG 200px X 1200px recommended
                </span>
                <input {...getBannerInputProps()} />
              </>
            )}
            {bannerImage?.imageUrl && (
              <div
                className="is-flex flex-1 is-flex-direction-column is-align-items-center is-justify-content-center rounded-lg"
                style={{
                  backgroundImage: `url(${bannerImage.imageUrl})`,
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  width: '100%',
                  opacity: 0.5,
                }}
              />
            )}
            {!isUpdatingBanner && (bannerImage.imageUrl || bannerImage.file) && (
              <div
                className="is-flex is-flex-direction-column is-align-items-center is-justify-content-center"
                style={{
                  borderRadius: '50%',
                  position: 'absolute',
                  zIndex: 10,
                  height: 40,
                  width: 40,
                  backgroundColor: '#4a4a4a',
                }}
              >
                <Upload className="has-text-white" />
                <input {...getBannerInputProps()} />
              </div>
            )}
            {isUpdatingBanner && (
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
      {showNameInputError && (
        <div className="pl-1 mt-2 transition-all">
          <p className="smaller-text has-text-red">
            The maximum length for Community Name is 50 characters
          </p>
        </div>
      )}
      <textarea
        className="text-area rounded-sm border-light p-3 column is-full mt-5"
        type="text"
        value={communityDescription}
        placeholder="Short Description"
        name="community_details"
        rows="3"
        cols="30"
        onChange={(event) => setCommunityDescription(event.target.value)}
        disabled={isUpdating}
      />
      {showDescriptionInputError && (
        <div className="pl-1 mt-2 transition-all">
          <p className="smaller-text has-text-red">
            The maximum length for Community Description is 1000 characters
          </p>
        </div>
      )}
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
