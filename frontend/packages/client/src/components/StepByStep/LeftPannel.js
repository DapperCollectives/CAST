import { Svg } from '@cast/shared-components';
import { useMediaQuery } from 'hooks';
import NextButton from './NexStepButton';
import SubmitButton from './SubmitButton';

const getStepIcon = ({
  stepIdx,
  stepLabel,
  showPreStep,
  currentStep,
  stepsSize,
}) => {
  const stepClasses = [];
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
    stepClasses.push('mb-6 is-align-items-center');
  }

  if (!showPreStep && stepIdx === currentStep) {
    return (
      <div className={`is-flex ${stepClasses.join(' ')}`} key={stepIdx}>
        <div
          className="rounded-full has-text-black has-background-yellow is-flex
              is-align-items-center is-justify-content-center"
          style={{
            width: 30,
            height: 30,
          }}
        >
          <b>{stepIdx + 1}</b>
        </div>
        {stepLabel ? <b className="ml-4">{stepLabel}</b> : divider}
      </div>
    );
  } else if (!showPreStep && currentStep > stepIdx) {
    return (
      <div className={`is-flex ${stepClasses.join(' ')}`} key={stepIdx}>
        <Svg name="CheckMark" circleFill="#44C42F" />
        {stepLabel ? <span className="ml-4">{stepLabel}</span> : divider}
      </div>
    );
  } else {
    return (
      <div className={`is-flex ${stepClasses.join(' ')}`} key={stepIdx}>
        <div
          className="rounded-full border-light is-flex is-align-items-center is-justify-content-center"
          style={{
            width: 30,
            height: 30,
          }}
        >
          {stepIdx + 1}
        </div>
        {stepLabel ? <span className="ml-4">{stepLabel}</span> : divider}
      </div>
    );
  }
};

const getBackLabel = ({ isSubmitting, onClick }) => (
  <div
    className="is-flex is-align-items-center has-text-grey cursor-pointer"
    // onClick={!isSubmitting ? () => onStepAdvance('prev') : () => {}}
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
            {currentStep > 0 && getBackLabel(isSubmitting)}
          </div>
          <div className="is-flex">
            {steps.map((step, i) => getStepIcon(i, null))}
          </div>
        </div>
      </div>
    );
  }
  // desktop version
  return (
    <div
      style={{
        paddingTop: '3rem',
        paddingRight: '5rem',
        minWidth: 326,
        position: 'fixed',
        minHeight: '100%',
      }}
      className="has-background-white-ter pl-4 is-hidden-mobile"
    >
      <div className="mb-6" style={{ minHeight: 24 }}>
        {currentStep > 0 &&
          getBackLabel({ isSubmitting, onClick: moveBackStep })}
      </div>
      <div>
        {steps.map((step, i) =>
          getStepIcon({
            stepIdx: i,
            stepLabel: step.label,
            stepsSize: steps.length,
            showPreStep,
            currentStep,
          })
        )}
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
