import { cloneElement, useCallback, useRef, useState } from 'react';
import { Prompt } from 'react-router-dom';
import { useMediaQuery } from 'hooks';
import Loader from '../Loader';
import LeftPanel from './LeftPanel';
import NavButton from './NavButton';
import NavStepByStep from './NavStepByStep';

function StepByStep({
  finalLabel,
  preStep,
  steps,
  onSubmit,
  isSubmitting,
  submittingMessage,
  passNextToComp = false,
  passSubmitToComp = false,
  blockNavigationOut = false,
  blockNavigationText,
  useControlsOnTopBar = true,
  previewComponent,
} = {}) {
  const notMobile = useMediaQuery();
  const [currentStep, setCurrentStep] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
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

  const moveToStep = (step) => setCurrentStep(step);

  const dismissPreStep = () => setShowPreStep(false);

  const togglePreviewMode = () => setPreviewMode((state) => !state);

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

  const child = previewMode
    ? previewComponent
    : showPreStep
    ? preStep
    : steps[currentStep].component;

  const { useHookForms = false } = steps[currentStep];

  const formId = useHookForms ? `form-Id-${currentStep}` : undefined;

  const moveToNextStep = () => onStepAdvance('next');

  const moveBackStep = () => onStepAdvance('prev');

  const _onSubmit = useCallback(
    () => onSubmit(stepsData),
    [onSubmit, stepsData]
  );

  const nextAction = currentStep + 1 === steps.length ? 'submit' : 'next';

  const navStepPosition = notMobile ? 'top' : 'bottom';

  const isPreviewModeVisible = currentStep > 0;

  return (
    <>
      {blockNavigationOut && (
        <Prompt
          when={true}
          message={() => blockNavigationText ?? 'Leave Page?'}
        />
      )}
      {useControlsOnTopBar && (
        <NavStepByStep
          position={navStepPosition}
          onClickBack={moveBackStep}
          isBackButtonEnabled={currentStep - 1 >= 0}
          onClickNext={moveToNextStep}
          isStepValid={isStepValid}
          showSubmitOrNext={nextAction}
          formId={formId}
          finalLabel={finalLabel}
          isSubmitting={isSubmitting}
          onClickPreview={togglePreviewMode}
          previewMode={previewMode}
          isPreviewModeVisible={isPreviewModeVisible}
        />
      )}
      <section
        style={
          useControlsOnTopBar
            ? navStepPosition === 'top'
              ? { paddingTop: '77px' }
              : { paddingBottom: '68px' }
            : {}
        }
      >
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
          <LeftPanel
            showBackButton={!useControlsOnTopBar}
            currentStep={currentStep}
            isSubmitting={isSubmitting}
            steps={steps}
            showPreStep={showPreStep}
            moveBackStep={moveBackStep}
            name={useControlsOnTopBar ? stepsData?.[0]?.name ?? '' : null}
            previewMode={previewMode}
            moveToStep={moveToStep}
          />

          {/* right panel */}
          <div
            className={`step-by-step-body flex-1 has-background-white px-4-mobile pt-0-mobile is-flex-mobile is-flex-direction-column-mobile`}
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
            <div className="is-hidden-tablet mt-3 mb-5">
              {Boolean(isPreviewModeVisible && !previewMode) && (
                <NavButton
                  disabled={isSubmitting}
                  onClick={togglePreviewMode}
                  classNames="vote-button transition-all"
                  text={'Preview'}
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
