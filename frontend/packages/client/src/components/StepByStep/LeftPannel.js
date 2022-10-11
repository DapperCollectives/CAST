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
            key={`step-and-icon-${i}`}
            stepIdx={i}
            stepLabel={step.label}
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
