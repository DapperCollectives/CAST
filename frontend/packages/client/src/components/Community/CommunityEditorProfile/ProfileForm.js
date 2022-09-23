import { useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { useModalContext } from 'contexts/NotificationModal';
import { Svg } from '@cast/shared-components';
import { Form, WrapperResponsive } from 'components';
import { MAX_AVATAR_FILE_SIZE, MAX_FILE_SIZE } from 'const';
import { getCroppedImg } from 'utils';
import classnames from 'classnames';
import FormFields from './FormFields';
import ImageCropModal from './ImageCropModal';

export default function ProfileForm({
  submitComponent,
  register,
  errors,
  isSubmitting,
  removeInnerForm = false,
  setValue,
  control,
  handleSubmit = () => {},
  logoImage,
  isUpdatingLogo = false,
  bannerImage,
  isUpdatingBanner = false,
} = {}) {
  const { notifyError } = useErrorHandlerContext();

  const { openModal, closeModal, isOpen } = useModalContext();
  const onDrop = useCallback(
    (filename, dataKey, maxFileSize) => (acceptedFiles) => {
      acceptedFiles.forEach((imageFile) => {
        // validate type
        if (
          !['image/png', 'image/jpeg', 'image/jpg'].includes(imageFile.type)
        ) {
          notifyError({
            message: 'Please upload a .png or .jpeg file type extension',
          });
          return;
        }
        // validate size
        if (imageFile.size > maxFileSize) {
          const sizeLimit =
            maxFileSize === MAX_AVATAR_FILE_SIZE ? '2MB' : '5MB';
          notifyError({
            message: `The selected file exceeds the ${sizeLimit} limit.`,
          });
          return;
        }
        const imageAsURL = URL.createObjectURL(imageFile);

        const img = new Image();
        img.onload = function (e) {
          setValue(
            dataKey,
            { imageUrl: imageAsURL, file: e.target, cropped: false },
            { shouldValidate: true, shouldDirty: true }
          );
        };

        img.src = imageAsURL;
      });
    },
    [setValue, notifyError]
  );

  const { getRootProps: getLogoRootProps, getInputProps: getLogoInputProps } =
    useDropzone({
      onDrop: onDrop('community_image', 'logo', MAX_AVATAR_FILE_SIZE),
      maxFiles: 1,
      accept: 'image/jpeg,image/png',
      useFsAccessApi: false,
    });

  const {
    getRootProps: getBannerRootProps,
    getInputProps: getBannerInputProps,
  } = useDropzone({
    onDrop: onDrop('community_banner', 'banner', MAX_FILE_SIZE),
    maxFiles: 1,
    accept: 'image/jpeg,image/png',
    useFsAccessApi: false,
  });

  const imageDropClasses = classnames(
    'is-flex is-flex-direction-column is-align-items-center is-justify-content-center cursor-pointer rounded-lg',
    {
      'border-dashed-dark': !bannerImage?.file && !bannerImage?.imageUrl,
    }
  );

  useEffect(() => {
    if (logoImage?.cropped === false && !isOpen) {
      openModal(
        <ImageCropModal
          cropperFn={getCroppedImg({
            dWidth: 150,
            dHeight: 150,
            fileName: 'logoImage',
          })}
          cropShape="round"
          logoImage={logoImage}
          defaultCropArea={{
            width: 400,
            height: 400,
            x: 100,
            y: 0,
          }}
          onDone={(image) => {
            setValue(
              'logo',
              {
                file: image.file,
                imageUrl: image.imageUrl,
                cropped: true,
              },
              { shouldValidate: true, shouldDirty: true }
            );
            closeModal();
          }}
        />,
        {
          classNameModalContent: 'rounded modal-content-image-crop',
          showCloseButton: false,
        }
      );
    }
  }, [logoImage, openModal, closeModal, isOpen, setValue]);

  useEffect(() => {
    if (bannerImage?.cropped === false && !isOpen) {
      openModal(
        <ImageCropModal
          cropperFn={getCroppedImg({
            dWidth: 1300,
            dHeight: 250,
            fileName: 'bannerImage',
          })}
          aspect={26 / 5}
          defaultCropArea={{
            width: 660,
            height: 125,
            x: 0,
            y: 125,
          }}
          logoImage={bannerImage}
          onDone={(image) => {
            setValue(
              'banner',
              {
                file: image.file,
                imageUrl: image.imageUrl,
                cropped: true,
              },
              { shouldValidate: true, shouldDirty: true }
            );
            closeModal();
          }}
        />,
        {
          classNameModalContent: 'rounded modal-content-image-crop',
          showCloseButton: false,
        }
      );
    }
  }, [bannerImage, openModal, closeModal, isOpen, setValue]);

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
                <Svg name="Upload" />
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
                <Svg name="Upload" className="has-text-white" />
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
                <Svg name="Upload" />
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
                <Svg name="Upload" className="has-text-white" />
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
      <Form
        methods={{ register }}
        removeInnerForm={removeInnerForm}
        onSubmit={handleSubmit}
      >
        <FormFields
          register={register}
          isSubmitting={isSubmitting}
          errors={errors}
          control={control}
        />
        {submitComponent}
      </Form>
    </WrapperResponsive>
  );
}
