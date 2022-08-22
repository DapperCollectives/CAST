import React, { useCallback, useEffect, useMemo } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useModalContext } from 'contexts/NotificationModal';
import Dropdown from 'components/common/Dropdown';
import Form from 'components/common/Form';
import Input from 'components/common/Input';
import { useCommunityDetails } from 'hooks';
import { kebabToString } from 'utils';
import { yupResolver } from '@hookform/resolvers/yup';
import pick from 'lodash/pick';
import CustomEditor from './Editor';
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

  const { openModal, closeModal } = useModalContext();

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

  // useEffect(() => {
  //   onDataChange({ description: localEditorState });
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [localEditorState]);

  const setTab = (option) => () => {
    onDataChange({
      proposalType: option,
    });
  };

  // const onEditorChange = (changes) => {
  //   setLocalEditorState(changes);
  // };

  const choices = useMemo(() => stepData?.choices || [], [stepData?.choices]);

  const onCreateChoice = useCallback(() => {
    onDataChange({
      choices: choices.concat([
        {
          id: choices.length + 1,
          value: '',
        },
      ]),
    });
  }, [onDataChange, choices]);

  const onDestroyChoice = useCallback(
    (choiceIdx) => {
      const newChoices = choices.slice(0);
      newChoices.splice(choiceIdx, 1);
      onDataChange({ choices: newChoices });
    },
    [choices, onDataChange]
  );

  const onChoiceChange = useCallback(
    (choiceUpdate, choiceIdx) => {
      const newChoices = choices.map((choice, idx) => {
        if (idx === choiceIdx) {
          return {
            ...choice,
            ...choiceUpdate,
          };
        }

        return choice;
      });

      onDataChange({ choices: newChoices });
    },
    [choices, onDataChange]
  );

  const initChoices = useCallback(
    (choices) => {
      onDataChange({
        choices,
      });
    },
    [onDataChange]
  );

  const fieldsObj = Object.assign(
    {},
    stepOne.initialValues,
    pick(stepData || {}, stepOne.formFields)
  );

  const { register, handleSubmit, watch, formState, control } = useForm({
    defaultValues: fieldsObj,
    resolver: yupResolver(stepOne.Schema),
  });

  const onSubmit = (data) => {
    console.log('data on submit >>', data);
    onDataChange(data);
    moveToNextStep();
  };
  const body = useWatch({ control, name: 'body' });

  const { isDirty, isSubmitting, isValid, errors } = formState;

  console.log('ERRORS => ', errors);
  console.log('isValid => ', isValid);
  console.log('body => ', body);

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
            <Controller
              name="body"
              control={control}
              render={({ field: { value, onChange } }) => {
                return <CustomEditor value={value} onChange={onChange} />;
              }}
            />
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
                choices={choices}
                onChoiceChange={onChoiceChange}
                onDestroyChoice={onDestroyChoice}
                onCreateChoice={onCreateChoice}
                initChoices={initChoices}
              />
            )}
            {tabOption === 'visual' && (
              <ImageChoices
                choices={choices}
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
