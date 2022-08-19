import React, { useCallback, useState } from 'react';
import { Prompt } from 'react-router-dom';
import Loader from '../Loader';
import { ArrowLeft, CheckMark } from '../Svg';

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
} = {}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showPreStep, setShowPreStep] = useState(!!preStep);
  const [isStepValid, setStepValid] = useState(false);
  const [stepsData, setStepsData] = useState({});
  const refs = React.useRef();
  const formRef = React.useRef();

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

  const getStepIcon = (stepIdx, stepLabel) => {
    const stepClasses = [];
    let divider = null;
    if (!stepLabel && stepIdx < steps.length - 1) {
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
            className="rounded-full has-text-black has-background-orange is-flex
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
          <CheckMark circleFill="#44C42F" />
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

  const child = showPreStep ? preStep : steps[currentStep].component;

  const { useHookForms = false } = steps[currentStep];

  const getBackLabel = () => (
    <div
      className="is-flex is-align-items-center has-text-grey cursor-pointer"
      onClick={() => onStepAdvance('prev')}
    >
      <ArrowLeft />
      <span className="ml-4">Back</span>
    </div>
  );

  const moveToNextStep = () => onStepAdvance('next');

  const _onSubmit = useCallback(
    () => onSubmit(stepsData),
    [onSubmit, stepsData]
  );

  const getNextButton = ({ formRef } = {}) => {
    console.log('formId', formRef);
    return (
      <div className="my-6">
        <buton
          className={`button is-block has-background-yellow rounded-sm py-2 px-4 has-text-centered`}
          onClick={
            formRef
              ? (e) => {
                  e.preventDefault();

                  formRef.current.dispatchEvent(
                    new Event('submit', { cancelable: true, bubbles: true })
                  );
                }
              : moveToNextStep
          }
        >
          Next
        </buton>
      </div>
    );
  };

  const getSubmitButton = () => (
    <div className="my-6">
      <div
        className={`button is-block has-background-yellow rounded-sm py-2 px-4 has-text-centered ${
          !isStepValid && 'is-disabled'
        }`}
        onClick={_onSubmit}
      >
        {finalLabel}
      </div>
    </div>
  );

  console.log('currentStep', steps[currentStep]);
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
          <div
            style={{
              paddingTop: '3rem',
              paddingRight: '5rem',
              minWidth: 280,
              position: 'fixed',
              minHeight: '100%',
            }}
            className="has-background-white-ter pl-4 is-hidden-mobile"
          >
            <div className="mb-6" style={{ minHeight: 24 }}>
              {currentStep > 0 && getBackLabel()}
            </div>
            <div>{steps.map((step, i) => getStepIcon(i, step.label))}</div>
            {currentStep < steps.length - 1 &&
              !passNextToComp &&
              getNextButton(useHookForms ? { formRef } : undefined)}
            {currentStep === steps.length - 1 &&
              !passSubmitToComp &&
              getSubmitButton()}
          </div>
          {/* left panel mobile */}
          <div
            className="is-hidden-tablet has-background-white-ter p-4"
            style={{ position: 'fixed', minWidth: '100%', zIndex: 2 }}
          >
            <div className="is-flex is-justify-content-space-between is-align-items-center">
              <div style={{ minHeight: 24 }}>
                {currentStep > 0 && getBackLabel()}
              </div>
              <div className="is-flex">
                {steps.map((step, i) => getStepIcon(i, null))}
              </div>
            </div>
          </div>
          {/* right panel */}
          <div className="step-by-step-body flex-1 has-background-white px-4-mobile pt-7-mobile">
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
              React.cloneElement(child, {
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
                formId: `form-Id-${currentStep}`,
                ...(useHookForms ? { formRef } : undefined),
              })}
            {/* <div className="is-hidden-tablet">
              {currentStep < steps.length - 1 &&
                !passNextToComp &&
                getNextButton({
                  formId: useHookForms ? `form-Id-${currentStep}` : undefined,
                })}
              {currentStep === steps.length - 1 &&
                !passSubmitToComp &&
                getSubmitButton({
                  formId: useHookForms ? `form-Id-${currentStep}` : undefined,
                })}
            </div> */}
          </div>
        </div>
      </section>
    </>
  );
}

export default StepByStep;
