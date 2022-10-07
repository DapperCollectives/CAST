import { Svg } from '@cast/shared-components';
import { useMediaQuery } from 'hooks';
import classnames from 'classnames';
import NextButton from './NexStepButton';
import SubmitButton from './SubmitButton';

const StepNumber = ({ stepIdx, status }) => {
  // status can be active - pending - done
  if (status === 'done') {
    return <Svg name="CheckMark" circleFill="#44C42F" />;
  }

  const classNames = classnames(
    'rounded-full has-text-black is-flex is-align-items-center is-justify-content-center',
    { 'has-background-yellow': status === 'active' },
    { 'border-light': status === 'pending' }
  );
  return (
    <div
      className={classNames}
      style={{
        width: 30,
        height: 30,
      }}
    >
      <b>{stepIdx + 1}</b>
    </div>
  );
};

const StepLabelAndIcon = ({
  stepIdx,
  stepLabel,
  showPreStep,
  currentStep,
  stepsSize,
  isMobile,
}) => {
  const stepClasses = isMobile ? [] : ['mb-4'];
  let divider = null;
  if (!stepLabel && stepIdx < stepsSize - 1) {
    stepClasses.push('mr-2');
    divider = (
      <span
        className="has-background-grey-light ml-2"
        style={{
          height: '1px',
          width: 20,
          position: 'relative',
          top: 14,
        }}
      />
    );
  }
  if (stepLabel) {
    stepClasses.push('is-align-items-center');
  }

  if (!showPreStep && stepIdx === currentStep) {
    return (
      <div className={`is-flex ${stepClasses.join(' ')}`} key={stepIdx}>
        <StepNumber stepIdx={stepIdx} status="active" />
        {stepLabel ? <b className="ml-4">{stepLabel}</b> : divider}
      </div>
    );
  } else if (!showPreStep && currentStep > stepIdx) {
    return (
      <div className={`is-flex ${stepClasses.join(' ')}`} key={stepIdx}>
        <StepNumber stepIdx={stepIdx} status="done" />
        {stepLabel ? <span className="ml-4">{stepLabel}</span> : divider}
      </div>
    );
  } else {
    return (
      <div className={`is-flex ${stepClasses.join(' ')}`} key={stepIdx}>
        <StepNumber stepIdx={stepIdx} status="pending" />
        {stepLabel ? <span className="ml-4">{stepLabel}</span> : divider}
      </div>
    );
  }
};

const BackButton = ({ isSubmitting, onClick }) => (
  <div
    className="is-flex is-align-items-center has-text-grey cursor-pointer"
    onClick={!isSubmitting ? onClick : () => {}}
  >
    <Svg name="ArrowLeft" />
    <span className="ml-4">Back</span>
  </div>
);

export default function LeftPannel({
  currentStep,
  isSubmitting,
  showNextButton,
  moveToNextStep,
  steps,
  showSubmitButton,
  formId,
  finalLabel,
  showPreStep,
  onSubmit,
  isStepValid,
  moveBackStep,
}) {
  const notMobile = useMediaQuery();

  // mobile version
  if (!notMobile) {
    return (
      <div
        className="is-hidden-tablet has-background-white-ter p-4"
        style={{ position: 'fixed', minWidth: '100%', zIndex: 2 }}
      >
        <div className="is-flex is-justify-content-space-between is-align-items-center">
          <div style={{ minHeight: 24 }}>
            {currentStep > 0 && <BackButton isSubmitting={isSubmitting} />}
          </div>
          <div className="is-flex">
            {steps.map((step, i) => (
              <StepLabelAndIcon
                stepIdx={i}
                stepsSize={steps.length}
                showPreStep={showPreStep}
                currentStep={currentStep}
                isMobile
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
  // desktop version
  return (
    <div
      style={{
        paddingRight: '5rem',
        minWidth: 326,
        position: 'fixed',
        minHeight: '100%',
      }}
      className="has-background-white-ter pl-4 is-hidden-mobile is-flex is-flex-direction-column is-justify-content-center"
    >
      <div className="mb-6" style={{ minHeight: 24 }}>
        {currentStep > 0 && (
          <BackButton isSubmitting={isSubmitting} onClick={moveBackStep} />
        )}
      </div>
      <div>
        {steps.map((step, i) => (
          <StepLabelAndIcon
            stepIdx={i}
            stepLabel={step.label}
            stepsSize={steps.length}
            showPreStep={showPreStep}
            currentStep={currentStep}
          />
        ))}
      </div>
      {currentStep < steps.length - 1 && showNextButton && (
        <NextButton
          formId={formId}
          moveToNextStep={moveToNextStep}
          disabled={!isStepValid}
        />
      )}
      {currentStep === steps.length - 1 && showSubmitButton && (
        <SubmitButton
          formId={formId}
          disabled={!isStepValid}
          onSubmit={onSubmit}
          label={finalLabel}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
