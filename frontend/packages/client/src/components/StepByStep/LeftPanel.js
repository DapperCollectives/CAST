import { useMediaQuery } from 'hooks';
import BackButton from './BackButton';
import StepLabelAndIcon from './StepLabelAndIcon';

export default function LeftPanel({
  currentStep,
  isSubmitting,
  steps,
  showPreStep,
  moveBackStep,
  name,
  showBackButton = true,
  previewMode,
  moveToStep,
  validatedSteps,
}) {
  const notMobile = useMediaQuery();

  const classNamesWrapper = 'pr-8 pr-1-tablet-only steps';
  // mobile version
  if (!notMobile) {
    if (previewMode) {
      return null;
    }
    return (
      <div
        className="has-background-white p-4"
        style={{ minWidth: '100%', zIndex: 2 }}
      >
        <div className="is-flex is-justify-content-space-between is-align-items-center">
          {showBackButton && (
            <div style={{ minHeight: 24 }}>
              {currentStep > 0 && <BackButton isSubmitting={isSubmitting} />}
            </div>
          )}
          <div className="is-flex">
            <div className="step-indicator-mobile rounded">
              <span className="p-3 small-text">
                {currentStep + 1} / {steps.length}
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
      {name !== null && (
        <div className="is-flex column p-0 is-12 mb-7">
          <span className="stepper-name is-flex-wrap-wrap is-size-3 has-text-weight-bold">
            {name}
          </span>
        </div>
      )}
      {showBackButton && (
        <div className="mb-6 steps" style={{ minHeight: 24 }}>
          {currentStep > 0 && (
            <BackButton isSubmitting={isSubmitting} onClick={moveBackStep} />
          )}
        </div>
      )}
      <div className={classNamesWrapper}>
        {steps.map((step, i) => (
          <StepLabelAndIcon
            key={`step-and-icon-${i}`}
            stepIdx={i}
            stepLabel={step.label}
            currentStep={currentStep}
            disableAll={previewMode || showPreStep}
            moveToStep={moveToStep}
            validatedSteps={validatedSteps}
          />
        ))}
      </div>
    </div>
  );
}
