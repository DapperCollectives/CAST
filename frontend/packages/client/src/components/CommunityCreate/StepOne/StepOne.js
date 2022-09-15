import { useForm, useWatch } from 'react-hook-form';
import { ActionButton } from 'components';
import { CommunityLinksForm } from 'components/Community/CommunityEditorLinks';
import { CommunityProfileForm } from 'components/Community/CommunityEditorProfile';
import { yupResolver } from '@hookform/resolvers/yup';
import pick from 'lodash/pick';
import { stepOne } from '../FormConfig';

const { FieldsArray, Schema, initialValues } = stepOne;

export default function StepOne({ stepData, onDataChange, moveToNextStep }) {
  const fieldsObj = Object.assign(
    {},
    initialValues,
    pick(stepData || {}, FieldsArray)
  );

  const { register, handleSubmit, formState, control, setValue } = useForm({
    defaultValues: fieldsObj,
    resolver: yupResolver(Schema),
    reValidateMode: 'onChange',
  });

  const { errors, isSubmitting, isValid, isDirty } = formState;

  const onSubmit = (data) => {
    onDataChange(data);
    moveToNextStep();
  };

  const logoField = useWatch({ control, name: 'logo' });
  const bannerField = useWatch({ control, name: 'banner' });

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
            label="Next: Community Details"
            enabled={(isDirty || isValid) && !isSubmitting}
            loading={isSubmitting}
            classNames="vote-button transition-all has-background-yellow mt-5 rounded-sm is-size-6"
          />
        </div>
      </div>
    </form>
  );
}
