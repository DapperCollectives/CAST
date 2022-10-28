import { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import Dropdown from 'components/common/Dropdown';
import Form from 'components/common/Form';
import Input from 'components/common/Input';
import { useCommunityDetails } from 'hooks';
import { kebabToString } from 'utils';
import { Heading } from '@chakra-ui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import pick from 'lodash/pick';
import { stepTwo } from '../FormConfig';
import VotingSelector from './VotingSelector';

const StepTwo = ({
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
    stepTwo.initialValues,
    {
      choices: [],
      tabOption: 'text-based',
      voteType: 'single-choice',
    },
    pick(stepData || {}, stepTwo.formFields)
  );

  const { register, handleSubmit, formState, control, setValue, clearErrors } =
    useForm({
      reValidateMode: 'onChange',
      defaultValues: fieldsObj,
      resolver: yupResolver(stepTwo.Schema),
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
  const voteType = useWatch({ control, name: 'voteType' });

  // **************************************************************
  //   This is to enable having choices when entering in preview mode
  //   fields are saved and validated when user hits on next
  //   by doing this we are saving the options before without validation
  //   when user hits next fields will be validated and overwritten with valid values
  //   for example it's possible to enter in preview mode with duplicated voting options
  //   but next will let the user know this needs to be updated
  const choicesTemp = useWatch({ control, name: 'choices' });
  const tabOption = useWatch({ control, name: 'tabOption' });
  useEffect(() => {
    let choices = choicesTemp;
    if (tabOption === 'visual') {
      choices = choicesTemp.slice(0, 2);
    } else {
      choices = choicesTemp.map((e) => ({ value: e.value }));
    }
    onDataChange({ choices });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [choicesTemp, tabOption]);
  // **************************************************************

  const { isDirty, isSubmitting, isValid, errors } = formState;

  useEffect(() => {
    setStepValid((isDirty || isValid) && !isSubmitting);
  }, [isDirty, isValid, isSubmitting, setStepValid]);

  return (
    <Form onSubmit={handleSubmit(onSubmit)} formId={formId}>
      <div className="is-flex-direction-column">
        <div className="border-light-tablet rounded-lg columns is-flex-direction-column is-mobile m-0 p-6 p-0-mobile mb-6">
          <Heading as="h4" fontSize="2xl" mb={2}>
            Voting Strategy <span className="has-text-danger">*</span>
          </Heading>
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
                containerClassNames="mt-4 mb-4"
                register={register}
                error={errors['minBalance']}
                name="minBalance"
              />
              <Input
                placeholder="Maximum Weight"
                containerClassNames="mb-4"
                register={register}
                error={errors['maxWeight']}
                name="maxWeight"
              />
            </>
          )}
        </div>
        <VotingSelector
          setValue={setValue}
          clearErrors={clearErrors}
          voteType={voteType}
          register={register}
          control={control}
          errors={errors}
        />
      </div>
    </Form>
  );
};

export default StepTwo;
