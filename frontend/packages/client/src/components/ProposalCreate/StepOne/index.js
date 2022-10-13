import { useEffect, useMemo, useState } from 'react';
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

  const [voteType, setVoteType] = useState('single-choice');

  const fieldsObj = Object.assign(
    {},
    stepOne.initialValues,
    {
      choices: [],
      tabOption: 'text-based',
      voteType: 'single-choice',
    },
    pick(stepData || {}, stepOne.formFields)
  );

  const { register, handleSubmit, formState, control, setValue, clearErrors } =
    useForm({
      reValidateMode: 'onChange',
      defaultValues: fieldsObj,
      resolver: yupResolver(stepOne.Schema),
    });

  const handleVoteType = (voteType) => {
    setVoteType(voteType);
    setValue('voteType', voteType);
  };

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

  const { isDirty, isSubmitting, isValid, errors } = formState;

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
                containerClassNames="mt-4 mb-4"
                register={register}
                error={errors['minBalance']}
                name="minBalance"
              />
              <Input
                placeholder="Maximum Weight"
                classNames="rounded-sm border-light p-3 column is-full"
                containerClassNames="mb-4"
                register={register}
                error={errors['maxWeight']}
                name="maxWeight"
              />
            </>
          )}
        </div>
        <div className="border-light rounded-lg columns is-flex-direction-column is-mobile m-0 p-6 mb-6">
          <h4 className="title is-5 mb-2">Type of Voting</h4>
          <p className="has-text-grey mb-5">
            Select the type of voting you would like to use for this proposal.
            To learn more about these options,{' '}
            <a
              target="_blank"
              rel="noreferrer noopener"
              href="https://docs.cast.fyi"
              className="is-underlined has-text-grey"
            >
              check out our FAQ
            </a>
            .
          </p>
          <div>
            <div
              className={`border-light rounded-sm is-flex is-align-items-center m-0 p-0 mb-4 cursor-pointer ${
                voteType === 'single-choice' ? 'border-grey' : 'border-light'
              }`}
              onClick={() => handleVoteType('single-choice')}
            >
              <div className="p-4">
                <div className="is-flex is-align-items-center mr-2">
                  <div className="is-flex is-align-items-center mr-2">
                    <label className="radio is-flex">
                      <input
                        {...register('voteType')}
                        type="radio"
                        value="single-choice"
                        className="green-radio"
                      />
                      <span />
                    </label>
                  </div>
                </div>
              </div>
              <div className="py-5 pr-5">
                <h5 className="title is-6 mb-2">Single Choice Voting</h5>
                <p>
                  Voters can only vote on one option and all options are
                  customized by proposal creator.
                </p>
              </div>
              <div className="has-background-light-grey p-4 rounded-sm-br rounded-sm-tr is-flex is-flex-direction-column is-align-self-stretch is-justify-content-center ">
                <div
                  className="is-flex is-align-items-center mb-1"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <div
                    className="rounded-full has-background-grey has-text-white mr-2 is-flex is-align-items-center is-justify-content-center"
                    style={{ width: 12, height: 12 }}
                  ></div>
                  <span className="smaller-text">Option A</span>
                </div>
                <div
                  className="is-flex is-align-items-center mb-1"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <div
                    className="rounded-full has-background-grey has-text-white mr-2 is-flex is-align-items-center is-justify-content-center"
                    style={{ width: 12, height: 12 }}
                  >
                    <span style={{ fontSize: 8 }}>&#x2713;</span>
                  </div>
                  <span className="smaller-text">Option B</span>
                </div>
                <div
                  className="is-flex is-align-items-center"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <div
                    className="rounded-full has-background-grey has-text-white mr-2 is-flex is-align-items-center is-justify-content-center"
                    style={{ width: 12, height: 12 }}
                  ></div>
                  <span className="smaller-text">Option C</span>
                </div>
              </div>
            </div>
            <div
              className={`border-light rounded-sm is-flex is-align-items-center m-0 p-0 cursor-pointer ${
                voteType === 'ranked-choice' ? 'border-grey' : 'border-light'
              }`}
              onClick={() => handleVoteType('ranked-choice')}
            >
              <div className="p-4">
                <div className="is-flex is-align-items-center mr-2">
                  <label className="radio is-flex">
                    <input
                      {...register('voteType')}
                      type="radio"
                      value="ranked-choice"
                      className="green-radio"
                    />
                    <span />
                  </label>
                </div>
              </div>
              <div className="py-5 pr-5">
                <h5 className="title is-6 mb-2">Ranked Voting</h5>
                <p>
                  Voters may select and rank any number of choices. Choices are
                  randomized by default.
                </p>
              </div>
              <div className="has-background-light-grey p-4 rounded-sm-br rounded-sm-tr is-flex is-flex-direction-column is-align-self-stretch is-justify-content-center">
                <div>
                  <div
                    className="is-flex is-align-items-center mb-1"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <div
                      className="rounded-full has-background-grey has-text-white mr-2 is-flex is-align-items-center is-justify-content-center"
                      style={{ width: 12, height: 12 }}
                    >
                      <span style={{ fontSize: 7 }}>1</span>
                    </div>
                    <span className="smaller-text">Option C</span>
                  </div>
                  <div
                    className="is-flex is-align-items-center mb-1"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <div
                      className="rounded-full has-background-grey has-text-white mr-2 is-flex is-align-items-center is-justify-content-center"
                      style={{ width: 12, height: 12 }}
                    >
                      <span style={{ fontSize: 7 }}>2</span>
                    </div>
                    <span className="smaller-text">Option B</span>
                  </div>
                  <div
                    className="is-flex is-align-items-center"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <div
                      className="rounded-full has-background-grey has-text-white mr-2 is-flex is-align-items-center is-justify-content-center"
                      style={{ width: 12, height: 12 }}
                    >
                      <span style={{ fontSize: 7 }}>3</span>
                    </div>
                    <span className="smaller-text">Option A</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
