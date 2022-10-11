import { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
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
        name:
          st.name === 'custom-script'
            ? `${kebabToString(st.name)}: ${kebabToString(st.contract.script)}`
            : kebabToString(st.name),
      })),
    [strategies]
  );

  const fieldsObj = Object.assign(
    {},
    stepOne.initialValues,
    {
      choices: [],
      tabOption: 'text-based',
    },
    pick(stepData || {}, stepOne.formFields)
  );

  const { register, handleSubmit, formState, control, setValue, clearErrors } =
    useForm({
      reValidateMode: 'onChange',
      defaultValues: fieldsObj,
      resolver: yupResolver(stepOne.Schema),
    });

  const onSubmit = (data) => {
    let choices;
    if (data.tabOption === 'visual') {
      choices = data.choices.slice(0, 2);
    } else {
      choices = data.choices.map((e) => ({ value: e.value }));
    }
    onDataChange({ ...data, choices });
    moveToNextStep();
  };

  const defaultValueStrategy = useWatch({ control, name: 'strategy' });
  const communityName = useWatch({ control, name: 'name' });

  const { isDirty, isSubmitting, isValid, errors } = formState;

  useEffect(() => {
    if (communityName && communityName?.length < 128) {
      onDataChange({ name: communityName });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityName]);

  useEffect(() => {
    setStepValid((isDirty || isValid) && !isSubmitting);
  }, [isDirty, isValid, isSubmitting, setStepValid]);

  return (
    <Form onSubmit={handleSubmit(onSubmit)} formId={formId}>
      <div className="is-flex-direction-column">
        <div className="border-light rounded-lg columns is-flex-direction-column is-mobile m-0 p-6 mb-6">
          <h4 className="title is-5 mb-2">
            Title <span className="has-text-danger">*</span>
          </h4>
          <p className="has-text-grey mb-4">
            Give your proposal a title based on the decision or initiative being
            voted on. Best to keep it simple and specific.
          </p>
          <Input
            classNames="rounded-sm border-light p-3 column is-full"
            register={register}
            error={errors['name']}
            name="name"
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
          {defaultValueStrategy && (
            <>
              <Input
                placeholder="Minimum Balance"
                classNames="rounded-sm border-light p-3 column is-full"
                conatinerClassNames="mt-4 mb-4"
                register={register}
                error={errors['minBalance']}
                name="minBalance"
              />
              <Input
                placeholder="Maximum Weight"
                classNames="rounded-sm border-light p-3 column is-full"
                conatinerClassNames="mb-4"
                register={register}
                error={errors['maxWeight']}
                name="maxWeight"
              />
            </>
          )}
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
            setValue={setValue}
            error={errors['choices']}
            fieldName="choices"
            register={register}
            control={control}
            clearErrors={clearErrors}
          />
        </div>
      </div>
    </Form>
  );
};

export default StepOne;
