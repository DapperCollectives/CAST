import React, { useCallback, useEffect } from 'react';
import { WrapperResponsive, Dropdown } from 'components';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'components/Svg';
import Input from 'components/common/Input';
import isEqual from 'lodash/isEqual';
import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import useLinkValidator, {
  urlPatternValidation,
} from 'components/Community/hooks/useLinkValidator';
import { useCommunityCategory } from 'hooks';
import { CommunityLinksForm2 } from 'components/Community/CommunityEditorLinks';
import {
  COMMUNITY_DESCRIPTION_MAX_LENGTH,
  COMMUNITY_NAME_MAX_LENGTH,
  MAX_AVATAR_FILE_SIZE,
  MAX_FILE_SIZE,
} from 'const';
import { getReducedImg, validateLength } from 'utils';
import classnames from 'classnames';
import pick from 'lodash/pick';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  StepOneSchema,
  StepOneFieldsArray,
  initialValues,
} from '../FormConfig';
import TextArea from 'components/common/TextArea';

export default function StepOne({
  stepData,
  setStepValid,
  onDataChange,
  moveToNextStep,
  isStepValid,
}) {
  console.log('stepData =====> ', stepData);
  const { notifyError } = useErrorHandlerContext();

  const { data: communityCategory } = useCommunityCategory();

  const setData = useCallback(
    (data) => {
      onDataChange(data);
    },
    [onDataChange]
  );

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
              onDataChange({
                [dataKey]: { imageUrl: imageAsURL, file: result.imageFile },
              });
            });
          } else {
            onDataChange({
              [dataKey]: { imageUrl: imageAsURL, file: imageFile },
            });
          }
        };
        img.src = imageAsURL;
      });
    },
    [onDataChange, notifyError]
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

  const { logo, banner, category } = stepData || {};

  // handle links form
  const fieldsObj = Object.assign(
    {},
    initialValues,
    pick(stepData || {}, StepOneFieldsArray)
  );

  const setCategoryValue = useCallback(
    (value) => {
      const selectedCat = (communityCategory ?? []).find(
        (cat) => cat.key === value
      );
      if (selectedCat) {
        setData({
          category: { value: selectedCat.key, label: selectedCat.description },
        });
      }
    },
    [communityCategory, setData]
  );

  // handles form validation
  useEffect(() => {
    const requiredFields = {
      logo: (logo) =>
        logo !== undefined ? logo?.file && logo?.imageUrl : true,
      communityTerms: (termsUrl) =>
        termsUrl?.length > 0 ? urlPatternValidation(termsUrl) : true,
      category: (cat) => cat?.value.length > 0,
    };
    const isValid = Object.keys(requiredFields).every(
      (field) => stepData && requiredFields[field](stepData[field])
    );
    setStepValid(true);
  }, [stepData, setStepValid, onDataChange]);

  const imageDropClasses = classnames(
    'is-flex is-flex-direction-column is-align-items-center is-justify-content-center cursor-pointer rounded-lg',
    {
      'border-dashed-dark': !banner?.file,
    }
  );

  const { register, handleSubmit, formState, watch } = useForm({
    defaultValues: fieldsObj,
    resolver: yupResolver(StepOneSchema),
  });

  const { errors, isSubmitting, isValid } = formState;

  const watchedFields = watch(StepOneFieldsArray);

  console.log(watchedFields);
  console.log('errors', errors);
  useEffect(() => {
    const toUpdate = Object.assign(
      {},
      ...StepOneFieldsArray.map((key, index) => ({
        [key]: watchedFields[index],
      }))
    );
    if (!isEqual(stepData, toUpdate) && isValid && !isSubmitting) {
      onDataChange({ ...toUpdate });
    }
  }, [onDataChange, stepData, watchedFields, isValid, isSubmitting]);

  const onSubmit = (data) => {
    console.log(data);
    if (isStepValid) {
      moveToNextStep();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <WrapperResponsive
        classNames="border-light rounded-lg columns is-flex-direction-column is-mobile m-0"
        extraClasses="p-6 mb-5"
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
                These details are publicly visible and will help people know
                what your community is all about.
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
                ...(!logo ? { border: '2px dashed #757575' } : undefined),
              }}
              {...getLogoRootProps()}
            >
              {logo ? (
                <div
                  className="is-flex flex-1 is-flex-direction-column is-align-items-center is-justify-content-center"
                  style={{
                    backgroundImage: `url(${logo.imageUrl})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    width: '100%',
                    opacity: 0.5,
                  }}
                />
              ) : (
                <>
                  <Upload />
                  <span className="smaller-text">Avatar</span>
                  <input {...getLogoInputProps()} />
                </>
              )}
              {logo?.file ? (
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
              ) : null}
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
              {banner ? (
                <div
                  className="is-flex flex-1 is-flex-direction-column is-align-items-center is-justify-content-center rounded-lg"
                  style={{
                    backgroundImage: `url(${banner.imageUrl})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    width: '100%',
                    opacity: 0.5,
                  }}
                />
              ) : (
                <>
                  <Upload />
                  <span className="smaller-text">Community Banner Image</span>
                  <span className="smaller-text">
                    JPG or PNG 200px X 1200px recommended
                  </span>
                  <input {...getBannerInputProps()} />
                </>
              )}
              {banner?.file ? (
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
              ) : null}
            </div>
          </div>
        </div>
        <Input
          placeholder="Community Name"
          register={register}
          name="communityName"
          disabled={isSubmitting}
          error={errors['communityName']}
          classNames="rounded-sm border-light p-3 column is-full mt-2"
        />
        <TextArea
          placeholder="Short Description"
          register={register}
          name="communityDescription"
          disabled={isSubmitting}
          error={errors['communityDescription']}
          classNames="text-area rounded-sm border-light p-3 column is-full mt-4"
        />
        <Dropdown
          label="Category"
          margin="mt-4"
          defaultValue={category}
          values={(communityCategory ?? []).map((cat) => ({
            label: cat.description,
            value: cat.key,
          }))}
          onSelectValue={setCategoryValue}
        />
        <Input
          placeholder="Terms  (e.g. https://example.com/terms)"
          register={register}
          name="communityTerms"
          disabled={isSubmitting}
          error={errors['communityTerms']}
          classNames="rounded-sm border-light p-3 column is-full mt-4"
        />
      </WrapperResponsive>
      <CommunityLinksForm2
        removeInnerForm
        register={register}
        errors={errors}
        isSubmitting={isSubmitting}
      />
      <div className="columns mb-5">
        <div className="column is-12">
          <button
            type="submit"
            style={{ height: 48, width: '100%' }}
            className={`button vote-button is-flex has-background-yellow rounded-sm is-size-6 is-uppercase is-${
              isStepValid ? 'enabled' : 'disabled'
            }`}
            // onClick={isStepValid ? () => moveToNextStep() : () => {}}
          >
            Next: COMMUNITY DETAILS
          </button>
        </div>
      </div>
    </form>
  );
}
