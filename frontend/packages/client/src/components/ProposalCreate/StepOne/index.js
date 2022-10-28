import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { Editor } from 'components/common/Editor';
import Form from 'components/common/Form';
import Input from 'components/common/Input';
import { Heading } from '@chakra-ui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import pick from 'lodash/pick';
import { NAME_MAX_LENGTH, stepOne } from '../FormConfig';

const StepOne = ({
  stepData,
  setStepValid,
  onDataChange,
  formId,
  moveToNextStep,
  isStepValid,
  setIsMovingNextStep,
  stepStatus,
  setStepStatus,
}) => {
  const { communityId } = useParams();
  const fieldsObj = Object.assign(
    {},
    stepOne.initialValues,
    pick(stepData || {}, stepOne.formFields),
    { communityId }
  );

  const { register, handleSubmit, formState, control } = useForm({
    reValidateMode: 'onChange',
    mode: 'onChange',
    defaultValues: fieldsObj,
    resolver: yupResolver(stepOne.Schema),
  });

  const onSubmit = (data) => {
    onDataChange(data);
    moveToNextStep();
  };

  const communityName = useWatch({ control, name: 'name' });

  const { isSubmitting, isValid, errors, isDirty } = formState;

  useEffect(() => {
    setIsMovingNextStep(isSubmitting);
    return () => {
      setIsMovingNextStep(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubmitting]);

  useEffect(() => {
    if (communityName && communityName?.length < 128) {
      onDataChange({ name: communityName });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityName]);

  useEffect(() => {
    // setting is valid to allow move forward to trigger validaiton
    // if form is not valid isValid will be set to false and will update here
    if (isStepValid !== (isValid || isDirty)) {
      setStepValid(isValid || isDirty);
    }
  }, [isValid, isStepValid, setStepValid, isDirty]);

  useEffect(() => {
    if (stepStatus === 'submitted' && isDirty) {
      setStepStatus('updated');
    }
  }, [isDirty, stepStatus, setStepStatus]);

  return (
    <Form onSubmit={handleSubmit(onSubmit)} formId={formId}>
      <div className="is-flex-direction-column">
        <div className="border-light-tablet rounded-lg columns is-flex-direction-column is-mobile m-0 p-0-mobile p-6 mb-6">
          <Heading as="h4" fontSize="2xl" mb={2}>
            Title <span className="has-text-danger">*</span>
          </Heading>
          <p className="has-text-grey mb-4">
            Give your proposal a title based on the decision or initiative being
            voted on. Best to keep it simple and specific.
          </p>
          <Input
            register={register}
            error={errors['name']}
            name="name"
            currentLength={communityName?.length ?? '0'}
            maxLengthSize={NAME_MAX_LENGTH}
          />
        </div>
        <div className="border-light-tablet rounded-lg columns is-flex-direction-column is-mobile m-0 p-6 p-0-mobile mb-6">
          <Heading as="h4" fontSize="2xl" mb={2}>
            Description <span className="has-text-danger">*</span>
          </Heading>
          <p className="has-text-grey mb-4">
            This is where you build the key information for the proposal: the
            details of what’s being voted on; background information for
            context; the expected costs and benefits of this collective
            decision.
          </p>
          <Editor name="body" control={control} error={errors['body']} />
        </div>
      </div>
    </Form>
  );
};

export default StepOne;
