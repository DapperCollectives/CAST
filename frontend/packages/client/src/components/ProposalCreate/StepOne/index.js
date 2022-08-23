import React, { useCallback, useEffect, useMemo } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useModalContext } from 'contexts/NotificationModal';
import Dropdown from 'components/common/Dropdown';
import { Editor } from 'components/common/Editor';
import Form from 'components/common/Form';
import Input from 'components/common/Input';
import { useCommunityDetails } from 'hooks';
import { kebabToString } from 'utils';
import { yupResolver } from '@hookform/resolvers/yup';
import pick from 'lodash/pick';
import { stepOne } from './FormConfig';
import ImageChoices from './ImageChoices';
import TextBasedChoices from './TextBasedChoices';

const StepOne = ({
  stepData,
  setStepValid,
  onDataChange,
  setPreCheckStepAdvance,
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

  const tabOption = useMemo(
    () => stepData?.proposalType || 'text-based',
    [stepData?.proposalType]
  );

  useEffect(() => {
    const requiredFields = {
      // description: (body) => body?.getCurrentContent().hasText(),
      choices: (opts) => {
        const getLabel = (o) => o?.value?.trim();
        const getImageUrl = (o) => o?.choiceImgUrl?.trim();
        const moreThanOne = Array.isArray(opts) && opts.length > 1;

        const optLabels = (opts || []).map((opt) => getLabel(opt));

        const haveLabels =
          moreThanOne && optLabels.every((opt) => opt.length > 0);

        const eachUnique =
          moreThanOne &&
          optLabels.every((opt, idx) => optLabels.indexOf(opt) === idx);

        if (tabOption === 'text-based') return haveLabels && eachUnique;

        const imagesUrl = (opts || []).map((opt) => getImageUrl(opt));

        const validImageOpts = imagesUrl.every(
          (imgUrl) => imgUrl && imgUrl.length > 0
        );

        return haveLabels && eachUnique && validImageOpts;
      },
    };
    const isValid = Object.keys(requiredFields).every(
      (field) => stepData && requiredFields[field](stepData[field])
    );
    setStepValid(true);
  }, [stepData, setStepValid, onDataChange, tabOption]);

  const setTab = (option) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDataChange({
      proposalType: option,
    });
  };

  const fieldsObj = Object.assign(
    {},
    stepOne.initialValues,
    { choices: [] },
    pick(stepData || {}, stepOne.formFields)
  );

  const { register, handleSubmit, formState, control } = useForm({
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
    console.log('data on submit >>', data);
    onDataChange(data);
    moveToNextStep();
  };

  const onCreateChoice = () =>
    append({
      value: '',
    });

  const onDestroyChoice = (choiceIdx) => {
    remove(choiceIdx);
  };

  const onChoiceChange = (choiceUpdate, choiceIdx) => {
    update(choiceIdx, choiceUpdate);
  };

  const initChoices = (choices) => {
    replace(choices);
  };

  const choicesss = useWatch({ control, name: 'choices' });

  const { isDirty, isSubmitting, isValid, errors } = formState;

  console.log('ERRORS => ', errors);
  console.log('isValid => ', isValid);
  console.log('choices  => ', choicesss);
  console.log('choicesN  => ', choicesField);

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
            <div className="tabs choice-option is-toggle mt-2 mb-4">
              <ul>
                <li>
                  <button
                    className={`button left ${
                      tabOption === 'text-based' ? 'is-black' : 'outlined'
                    }`}
                    onClick={setTab('text-based')}
                  >
                    <span>Text-based</span>
                  </button>
                </li>
                <li>
                  <button
                    className={`button right ${
                      tabOption === 'visual' ? 'is-black' : 'outlined'
                    }`}
                    onClick={setTab('visual')}
                  >
                    <span>Visual</span>
                  </button>
                </li>
              </ul>
            </div>
            {tabOption === 'text-based' && (
              <TextBasedChoices
                choices={choicesField}
                onChoiceChange={onChoiceChange}
                onDestroyChoice={onDestroyChoice}
                onCreateChoice={onCreateChoice}
                initChoices={initChoices}
              />
            )}
            {tabOption === 'visual' && (
              <ImageChoices
                choices={choicesField}
                onChoiceChange={onChoiceChange}
                initChoices={initChoices}
              />
            )}
          </div>
        </div>
      </Form>
    </>
  );
};

export default StepOne;
