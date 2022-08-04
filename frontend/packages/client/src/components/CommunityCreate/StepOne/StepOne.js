import React, { useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { useCommunityCategory } from 'hooks';
import { WrapperResponsive } from 'components';
import { Upload } from 'components/Svg';
import { CommunityLinksForm } from 'components/Community/CommunityEditorLinks';
import { CommunityProfileForm } from 'components/Community/CommunityEditorProfile';
import { MAX_AVATAR_FILE_SIZE, MAX_FILE_SIZE } from 'const';
import { getReducedImg } from 'utils';
import classnames from 'classnames';
import pick from 'lodash/pick';
import {
  StepOneSchema,
  StepOneFieldsArray,
  initialValues,
} from '../FormConfig';
import TextArea from 'components/common/TextArea';
import Dropdown from 'components/common/Dropdown';
import Input from 'components/common/Input';
import { ActionButton } from 'components';
export default function StepOne({
  stepData,
  setStepValid,
  onDataChange,
  moveToNextStep,
  isStepValid,
}) {
  console.log(stepData);
  // handle links form
  const fieldsObj = Object.assign(
    {},
    initialValues,
    pick(stepData || {}, StepOneFieldsArray)
  );

  const { register, handleSubmit, formState, watch, control, setValue } =
    useForm({
      defaultValues: fieldsObj,
      resolver: yupResolver(StepOneSchema),
      reValidateMode: 'onChange',
    });

  console.log(register('logo'));
  const { errors, isSubmitting, isValid, isDirty } = formState;

  const watchedFields = watch(StepOneFieldsArray);

  console.log(watchedFields);
  console.log('errors', errors);
  console.log('isValid', isValid);
  const onSubmit = (data) => {
    console.log('data', data);
    onDataChange(data);
    moveToNextStep();
  };

  const { logo, banner } = stepData || {};

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <CommunityProfileForm
        register={register}
        errors={errors}
        isSubmitting={isSubmitting}
        removeInnerForm
        setValue={setValue}
        control={control}
        logoImage={logo}
        bannerImage={banner}
      />
      <CommunityLinksForm
        removeInnerForm
        register={register}
        errors={errors}
        isSubmitting={isSubmitting}
      />
      <div className="columns mb-5">
        <div className="column is-12">
          <ActionButton
            type="submit"
            label="Next: COMMUNITY DETAILS"
            enabled={(isDirty || isValid) && !isSubmitting}
            loading={isSubmitting}
            classNames="vote-button transition-all has-background-yellow mt-5 rounded-sm is-size-6"
          />
        </div>
      </div>
    </form>
  );
}
