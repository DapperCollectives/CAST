import React, { useCallback } from 'react';
import { WrapperResponsive, Form } from 'components';
import FormFields from './FormFields';
import { useDropzone } from 'react-dropzone';
import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { Upload } from 'components/Svg';
import { MAX_AVATAR_FILE_SIZE, MAX_FILE_SIZE } from 'const';
import { getReducedImg } from 'utils';
import classnames from 'classnames';

export default function ProfileForm({
  submitComponent,
  register,
  errors,
  isSubmitting,
  removeInnerForm,
  setValue,
  control,
  handleSubmit = () => {},
  logoImage,
  isUpdatingLogo = false,
  bannerImage,
  isUpdatingBanner = false,
} = {}) {
  const { notifyError } = useErrorHandlerContext();

  const onDrop = useCallback(
    (filename, dataKey, maxFileSize, maxWidth) => (acceptedFiles) => {
      acceptedFiles.forEach((imageFile) => {
        // validate type
        if (
          !['image/png', 'image/jpeg', 'image/jpg'].includes(imageFile.type)
        ) {
          notifyError({
            status: 'Image type not supported',
            statusText: 'Please upload a .png or .jpeg file type extension',
          });
          return;
        }
        // validate size
        if (imageFile.size > maxFileSize) {
          const sizeLimit =
            maxFileSize === MAX_AVATAR_FILE_SIZE ? '2MB' : '5MB';
          notifyError({
            status: 'Image file size not allowed',
            statusText: `The selected file exceeds the ${sizeLimit} limit.`,
          });
          return;
        }
        const imageAsURL = URL.createObjectURL(imageFile);

        const img = new Image();
        img.onload = function (e) {
          // reduce images if necessary before upload
          if (e.target.width > maxWidth) {
            getReducedImg(e.target, maxWidth, filename).then((result) => {
              setValue(
                dataKey,
                {
                  imageUrl: imageAsURL,
                  file: result.imageFile,
                },
                { shouldValidate: true, shouldDirty: true }
              );
            });
          } else {
            setValue(
              dataKey,
              { imageUrl: imageAsURL, file: imageFile },
              { shouldValidate: true, shouldDirty: true }
            );
          }
        };
        img.src = imageAsURL;
      });
    },
    [setValue, notifyError]
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
      'border-dashed-dark': !bannerImage?.file && !bannerImage?.imageUrl,
    }
  );

  const formFieldsComponent = (
    <FormFields
      register={register}
      isSubmitting={isSubmitting}
      errors={errors}
      control={control}
    />
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
              ...(!logoImage?.imageUrl
                ? { border: '2px dashed #757575' }
                : undefined),
            }}
            {...getLogoRootProps()}
          >
            {!isUpdatingLogo && !logoImage?.imageUrl && !logoImage?.file && (
              <>
                <Upload />
                <span className="smaller-text">Avatar</span>
                <input {...getLogoInputProps()} />
              </>
            )}
            {logoImage?.imageUrl && (
              <div
                className="is-flex flex-1 is-flex-direction-column is-align-items-center is-justify-content-center"
                style={{
                  backgroundImage: `url(${logoImage.imageUrl})`,
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: 'cover',
                  width: '100%',
                  opacity: 0.5,
                }}
              />
            )}
            {!isUpdatingLogo && (logoImage?.imageUrl || logoImage?.file) && (
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
            {isUpdatingLogo && (
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
            {!isUpdatingBanner && (bannerImage?.imageUrl || bannerImage?.file) && (
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
      {removeInnerForm ? (
        <>{formFieldsComponent}</>
      ) : (
        <Form methods={{ register }} handleSubmit={handleSubmit}>
          {formFieldsComponent}
          {submitComponent}
        </Form>
      )}
    </WrapperResponsive>
  );
}
