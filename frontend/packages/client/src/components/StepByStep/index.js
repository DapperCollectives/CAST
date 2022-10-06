import { cloneElement, useCallback, useRef, useState } from 'react';
import { Prompt } from 'react-router-dom';
import Loader from '../Loader';
import LeftPannel from './LeftPannel';
import NextButton from './NexStepButton';
import SubmitButton from './SubmitButton';

function StepByStep({
  finalLabel,
  preStep,
  steps,
  onSubmit,
  isSubmitting,
  submittingMessage,
  passNextToComp = false,
  showActionButtonLeftPannel = false,
  passSubmitToComp = false,
  blockNavigationOut = false,
  blockNavigationText,
} = {}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showPreStep, setShowPreStep] = useState(!!preStep);
  const [isStepValid, setStepValid] = useState(false);
  const [stepsData, setStepsData] = useState({});
  const refs = useRef();

  const onStepAdvance = (direction = 'next') => {
    if (direction === 'next') {
      if (currentStep + 1 <= steps.length - 1) {
        const enableAdvance = runPreCheckStepAdvance();
        if (!enableAdvance) {
          return;
        }
        setCurrentStep(currentStep + 1);
      }
    } else if (direction === 'prev') {
      if (currentStep - 1 >= 0) {
        setCurrentStep(currentStep - 1);
      }
    }
  };

  const dismissPreStep = () => setShowPreStep(false);

  const runPreCheckStepAdvance = () => {
    if (refs.current) {
      const runCheckResult = refs.current();
      if (!runCheckResult) {
        return false;
      }
      refs.current = null;
    }
    return true;
  };

  const setPreCheckStepAdvance = useCallback(
    (fnCheck) => {
      // this is overwritten per component on the set
      refs.current = fnCheck;
    },
    [refs]
  );

  const child = showPreStep ? preStep : steps[currentStep].component;

  const { useHookForms = false } = steps[currentStep];

  const formId = useHookForms ? `form-Id-${currentStep}` : undefined;

  const moveToNextStep = () => onStepAdvance('next');

  const moveBackStep = () => onStepAdvance('prev');

  const _onSubmit = useCallback(
    () => onSubmit(stepsData),
    [onSubmit, stepsData]
  );

  const showNextButton = !passNextToComp || showActionButtonLeftPannel;
  const showSubmitButton = !passSubmitToComp || showActionButtonLeftPannel;

  return (
    <>
      {blockNavigationOut && (
        <Prompt
          when={true}
          message={() => blockNavigationText ?? 'Leave Page?'}
        />
      )}
      <section>
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '50%',
            height: '100vh',
            zIndex: -1,
          }}
          className="has-background-white-ter is-hidden-mobile"
        />
        <div className="container is-flex is-flex-direction-column-mobile">
          {/* left panel */}
          <LeftPannel
            currentStep={currentStep}
            isSubmitting={isSubmitting}
            showNextButton={showNextButton}
            moveToNextStep={moveToNextStep}
            steps={steps}
            showSubmitButton={showSubmitButton}
            formId={formId}
            finalLabel={finalLabel}
            showPreStep={showPreStep}
            onSubmit={_onSubmit}
            isStepValid={isStepValid}
            moveBackStep={moveBackStep}
          />

          {/* right panel */}
          <div
            className={`step-by-step-body flex-1 has-background-white px-4-mobile pt-7-mobile is-flex-mobile is-flex-direction-column-mobile`}
          >
            {isSubmitting && (
              <div
                className="is-flex flex-1 is-flex-direction-column is-align-items-center is-justify-content-center"
                style={{ height: '100%' }}
              >
                <Loader className="mb-4" />
                <p className="has-text-grey">{submittingMessage}</p>
              </div>
            )}

            {!isSubmitting &&
              cloneElement(child, {
                onDataChange: (stepData) => {
                  setStepsData({
                    ...stepsData,
                    [currentStep]: {
                      ...stepsData[currentStep],
                      ...stepData,
                    },
                  });
                },
                setStepValid,
                isStepValid,
                stepData: stepsData[currentStep],
                stepsData,
                setPreCheckStepAdvance,
                ...(currentStep < steps.length - 1 && passNextToComp
                  ? { moveToNextStep }
                  : undefined),
                ...(currentStep === steps.length - 1 && passSubmitToComp
                  ? { onSubmit: _onSubmit }
                  : undefined),
                ...(showPreStep ? { dismissPreStep } : undefined),
                ...(useHookForms ? { formId } : undefined),
              })}
            <div className="is-hidden-tablet">
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
                  onSubmit={_onSubmit}
                  label={finalLabel}
                  isSubmitting={isSubmitting}
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default StepByStep;
