import { useMediaQuery } from 'hooks';
import BackButton from './BackButton';
import NextButton from './NexStepButton';
import StepLabelAndIcon from './StepLabelAndIcon';
import SubmitButton from './SubmitButton';

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
  name,
}) {
  const notMobile = useMediaQuery();

  const classNamesWrapper = 'pr-8 pr-1-tablet-only steps';
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
            <div className="step-indicator-mobile rounded">
              <span className="p-3 small-text">
                {currentStep} / {steps.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  // desktop version
  return (
    <div className="step-by-step has-background-white-ter is-hidden-mobile is-flex is-flex-direction-column is-justify-content-flex-start pt-6">
      <div className="is-flex column p-0 is-12">
        <span className="stepper-name is-flex-wrap-wrap is-size-3 has-text-weight-bold">
          {name}
        </span>
      </div>
      <div className="mb-6" style={{ minHeight: 24 }}>
        {currentStep > 0 && (
          <BackButton isSubmitting={isSubmitting} onClick={moveBackStep} />
        )}
      </div>
      <div className={classNamesWrapper}>
        {steps.map((step, i) => (
          <StepLabelAndIcon
            key={`step-and-icon-${i}`}
            stepIdx={i}
            stepLabel={step.label}
            showPreStep={showPreStep}
            currentStep={currentStep}
          />
        ))}
      </div>
      {currentStep < steps.length - 1 && showNextButton && (
        <div className={classNamesWrapper}>
          <NextButton
            formId={formId}
            moveToNextStep={moveToNextStep}
            disabled={!isStepValid}
          />
        </div>
      )}
      {currentStep === steps.length - 1 && showSubmitButton && (
        <div className={classNamesWrapper}>
          <SubmitButton
            formId={formId}
            disabled={!isStepValid}
            onSubmit={onSubmit}
            label={finalLabel}
            isSubmitting={isSubmitting}
          />
        </div>
      )}
    </div>
  );
}
