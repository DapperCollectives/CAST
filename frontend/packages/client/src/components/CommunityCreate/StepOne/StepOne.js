import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { CommunityLinksForm } from 'components/Community/CommunityEditorLinks';
import { CommunityProfileForm } from 'components/Community/CommunityEditorProfile';
import pick from 'lodash/pick';
import {
  StepOneSchema,
  StepOneFieldsArray,
  initialValues,
} from '../FormConfig';
import { ActionButton } from 'components';

export default function StepOne({ stepData, onDataChange, moveToNextStep }) {
  const fieldsObj = Object.assign(
    {},
    initialValues,
    pick(stepData || {}, StepOneFieldsArray)
  );

  const { register, handleSubmit, formState, control, setValue, watch } =
    useForm({
      defaultValues: fieldsObj,
      resolver: yupResolver(StepOneSchema),
      reValidateMode: 'onChange',
    });

  const { errors, isSubmitting, isValid, isDirty } = formState;

  const onSubmit = (data) => {
    onDataChange(data);
    moveToNextStep();
  };

  const logoField = watch('logo');
  const bannerField = watch('banner');

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <CommunityProfileForm
        register={register}
        errors={errors}
        isSubmitting={isSubmitting}
        removeInnerForm
        setValue={setValue}
        control={control}
        logoImage={logoField}
        bannerImage={bannerField}
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
