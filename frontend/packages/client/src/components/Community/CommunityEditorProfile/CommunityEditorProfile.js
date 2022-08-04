import React, { useEffect, useState } from 'react';
import { ActionButton } from 'components';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ProfileSchema, initialValues } from './FormConfig';
import ProfileForm from './ProfileForm';

export default function CommunityEditorProfile({
  name,
  body = '',
  logo,
  banner,
  category,
  terms,
  // fn to update community payload
  updateCommunity,
  // fn to upload image
  uploadFile,
} = {}) {
  const [isUpdatingImage, setIsUpdatingImage] = useState(false);
  const [isUpdatingBanner, setIsUpdatingBanner] = useState(false);

  const { register, handleSubmit, formState, watch, control, setValue, reset } =
    useForm({
      defaultValues: {
        ...initialValues,
        communityName: name,
        communutyDescription: body,
        communityCategory: category,
        logo: { imageUrl: logo },
        banner: { imageUrl: banner },
        communityTerms: terms,
      },
      resolver: yupResolver(ProfileSchema),
    });

  const logoField = watch('logo');
  const bannerField = watch('banner');

  const { errors, isSubmitting, isSubmitSuccessful, isDirty } = formState;

  useEffect(() => {
    reset({}, { keepValues: true });
  }, [isSubmitSuccessful, reset]);

  const onSubmit = async (data) => {
    const {
      communityName,
      communityDescription,
      communityCategory,
      communityTerms,
    } = data;

    let newImageUrl;
    let newBannerImageUrl;
    if (data?.logoImage?.file) {
      setIsUpdatingImage(true);
      newImageUrl = await uploadFile(data?.logoImage?.fil);
    }
    if (data?.bannerImage?.file) {
      setIsUpdatingBanner(true);
      newBannerImageUrl = await uploadFile(data?.bannerImage?.fil);
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
      ...(communityCategory !== category
        ? { category: communityCategory }
        : undefined),
      ...(communityTerms !== terms
        ? { termsAndConditionsUrl: communityTerms }
        : undefined),
    };
    // updated fields
    if (Object.keys(updates).length > 0) {
      await updateCommunity(updates);
    }
    setIsUpdatingImage(false);
    setIsUpdatingBanner(false);
  };

  return (
    <ProfileForm
      submitComponent={
        <ActionButton
          label="save"
          enabled={isDirty && !isSubmitting}
          loading={isSubmitting}
          classNames="vote-button transition-all has-background-yellow mt-5"
        />
      }
      errors={errors}
      register={register}
      isSubmitting={isSubmitting}
      handleSubmit={handleSubmit(onSubmit)}
      setValue={setValue}
      logoImage={logoField}
      bannerImage={bannerField}
      control={control}
      isUpdatingLogo={isUpdatingImage}
      isUpdatingBanner={isUpdatingBanner}
    />
  );
}
