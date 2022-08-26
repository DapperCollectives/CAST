import React, { useEffect, useMemo } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import Dropdown from 'components/common/Dropdown';
import { Editor } from 'components/common/Editor';
import Form from 'components/common/Form';
import Input from 'components/common/Input';
import { useCommunityDetails } from 'hooks';
import { kebabToString } from 'utils';
import { yupResolver } from '@hookform/resolvers/yup';
import pick from 'lodash/pick';
import { stepOne } from '../FormConfig';
import ChoiceOptionCreator from './ChoiceOptionCreator';

const StepOne = ({
  stepData,
  setStepValid,
  onDataChange,
  formId,
  moveToNextStep,
}) => {
  const { communityId } = useParams();

  const { data: community } = useCommunityDetails(communityId);

  const { strategies = [] } = community || {};

  const votingStrategies = useMemo(
    () =>
      strategies.map((st) => ({
        key: st.name,
        name: kebabToString(st.name),
      })),
    [strategies]
  );

  const fieldsObj = Object.assign(
    {},
    stepOne.initialValues,
    { choices: [], tabOption: 'text-based' },
    pick(stepData || {}, stepOne.formFields)
  );

  const { register, handleSubmit, formState, control, setValue } = useForm({
    defaultValues: fieldsObj,
    resolver: yupResolver(stepOne.Schema),
  });

  const {
    fields: choicesField,
    append,
    remove,
    update,
    replace,
  } = useFieldArray({
    control,
    name: 'choices',
    focusAppend: true,
  });

  const onSubmit = (data) => {
    onDataChange(data);
    moveToNextStep();
  };

  const tabOption = useWatch({ control, name: 'tabOption' });

  const { isDirty, isSubmitting, isValid, errors } = formState;

  useEffect(() => {
    setStepValid((isDirty || isValid) && !isSubmitting);
  }, [isDirty, isValid, isSubmitting, setStepValid]);

  console.log('all errors ', errors);
  return (
    <>
      <Form onSubmit={handleSubmit(onSubmit)} formId={formId}>
        <div className="is-flex-direction-column">
          <div className="border-light rounded-lg columns is-flex-direction-column is-mobile m-0 p-6 mb-6">
            <h4 className="title is-5 mb-2">
              Title <span className="has-text-danger">*</span>
            </h4>
            <p className="has-text-grey mb-4">
              Give your proposal a title based on the decision or initiative
              being voted on. Best to keep it simple and specific.
            </p>
            <Input
              classNames="rounded-sm border-light p-3 column is-full"
              register={register}
              error={errors['title']}
              name="title"
            />
          </div>
          <div className="border-light rounded-lg columns is-flex-direction-column is-mobile m-0 p-6 mb-6">
            <h4 className="title is-5 mb-2">
              Description <span className="has-text-danger">*</span>
            </h4>
            <p className="has-text-grey mb-4">
              This is where you build the key information for the proposal: the
              details of what’s being voted on; background information for
              context; the expected costs and benefits of this collective
              decision.
            </p>
            <Editor name="body" control={control} error={errors['body']} />
          </div>
          <div className="border-light rounded-lg columns is-flex-direction-column is-mobile m-0 p-6 mb-6">
            <h4 className="title is-5 mb-2">Voting Strategy</h4>
            <p className="has-text-grey mb-5">
              Select a strategy for how voting power is calculated. Voting
              strategies are set by community admins.
            </p>
            <Dropdown
              label="Select from drop-down menu"
              name="strategy"
              margin="mt-4"
              options={
                votingStrategies?.map((vs) => ({
                  label: vs.name,
                  value: vs.key,
                })) ?? []
              }
              disabled={isSubmitting || votingStrategies.length === 0}
              control={control}
            />
          </div>
          <div className="border-light rounded-lg columns is-flex-direction-column is-mobile m-0 p-6 mb-6">
            <h4 className="title is-5 mb-2">
              Choices <span className="has-text-danger">*</span>
            </h4>
            <p className="has-text-grey mb-4">
              Provide the specific options you’d like to cast votes for. Use
              Text-based presentation for choices that described in words. Use
              Visual for side-by-side visual options represented by images.
            </p>
            <ChoiceOptionCreator
              choices={choicesField}
              tabOption={tabOption}
              setValue={setValue}
              append={append}
              remove={remove}
              replace={replace}
              error={errors['choices']}
              fieldName="choices"
              register={register}
              update={update}
            />
          </div>
        </div>
      </Form>
    </>
  );
};

export default StepOne;
