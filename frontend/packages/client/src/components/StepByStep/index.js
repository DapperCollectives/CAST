import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from 'react';
import { ArrowLeft, CheckMark } from '../Svg';
import Loader from '../Loader';
import defaultsDeep from 'lodash/defaultsDeep';
import { useSearchParams } from 'react-router-dom';

const defaultStyles = {
  currentStep: {
    icon: {
      textColor: 'has-text-black',
      hexBackgroundColor: 'has-background-orange',
    },
  },
  completeStep: {
    icon: {
      hexBackgroundColor: '#44C42F',
    },
  },
};

const allValidSteps = (validStepVals, displayStepNum) => {
  if (validStepVals.length < 1) return false;

  const sliceUpTo = displayStepNum >= 1 ? displayStepNum - 1 : 1;
  return validStepVals.slice(0, sliceUpTo).every((val) => val === true);
};

/**
 * NOTE:
 * currentStep is the number representing the index in the steps array (0 to n)
 * displayStep is the string representing the display value in the URL (1 to n)
 */
function StepByStep({
  finalLabel,
  preStep,
  steps,
  onSubmit,
  isSubmitting,
  submittingMessage,
  passNextToComp = false,
  passSubmitToComp = false,
  styleConfig = {},
} = {}) {
  const customStyle = defaultsDeep(styleConfig, defaultStyles);

  const [currentStep, setCurrentStep] = useState(0);
  const [showPreStep, setShowPreStep] = useState(!!preStep);
  const [isStepValid, setIsStepValid] = useState(false);
  const [stepsData, setStepsData] = useState({});
  const refs = useRef();
  const [validSteps, setValidSteps] = useState({});
  const setStepValid = (validity) => {
    if (validSteps[currentStep] !== validity) {
      setValidSteps((prevState) => ({ ...prevState, [currentStep]: validity }));
    }
    setIsStepValid(validity);
  };

  const dismissPreStep = () => setShowPreStep(false);

  const setPreCheckStepAdvance = useCallback(
    (fnCheck) => {
      // this is overwritten per component on the set
      refs.current = fnCheck;
    },
    [refs]
  );

  const [searchParams, setSearchParams] = useSearchParams();

  const goToStep = useCallback(
    (step, replace = false) => {
      searchParams.set('step', step + 1);
      setSearchParams(searchParams, { replace });
    },
    [searchParams, setSearchParams]
  );
  const tryToGoForward = useCallback(() => {
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
    const canAdvance = runPreCheckStepAdvance();
    if (currentStep + 1 < steps.length && canAdvance) {
      goToStep(currentStep + 1);
    }
  }, [currentStep, goToStep, refs, steps.length]);
  const tryToGoBack = useCallback(() => {
    if (currentStep - 1 >= 0) {
      goToStep(currentStep - 1);
    }
  }, [currentStep, goToStep]);

  useEffect(() => {
    // check if displayStep is valid
    const displayStep = searchParams.get('step');
    const displayStepNum = !isNaN(Number(displayStep))
      ? Number(displayStep)
      : -1;

    if (showPreStep && displayStepNum <= 1) return;

    if (
      displayStep === null || // first time, need to set step in URL
      displayStep === undefined || // first time, need to set step in URL
      displayStepNum <= 0 || // prevent out-of-bounds values
      displayStepNum > steps.length || // prevent out-of-bounds values
      (showPreStep && displayStepNum > 1) // correct displayStep if preStep not dismissed
    ) {
      setValidSteps({});
      goToStep(0, true);
    }
  }, [searchParams, steps.length, setValidSteps, goToStep, showPreStep]);

  const dataValidForStep = useMemo(() => {
    const displayStep = searchParams.get('step');
    const displayStepNum = !isNaN(Number(displayStep))
      ? Number(displayStep)
      : -1;
    const validStepVals = Object.values(validSteps);

    return (
      (preStep &&
        (displayStepNum <= 2 ||
          (allValidSteps(validStepVals, displayStepNum) &&
            validStepVals.length > 1))) ||
      (!preStep &&
        (displayStepNum <= 1 || allValidSteps(validStepVals, displayStepNum)))
    );
  }, [searchParams, preStep, validSteps]);

  useEffect(() => {
    if (showPreStep) return;

    // check if valid condition to go forward/back
    const displayStep = searchParams.get('step');
    const displayStepNum = !isNaN(Number(displayStep))
      ? Number(displayStep)
      : -1;

    if (!dataValidForStep) {
      // prevent reaching a subsequent step if prior steps have mismatched or no data
      setValidSteps({});
      goToStep(0, true);
    } else if (displayStepNum - 1 !== currentStep) {
      // navigated, so update currentStep to match
      setCurrentStep(displayStepNum - 1);
    }
    // else valid & matching, so do nothing
  }, [currentStep, goToStep, searchParams, showPreStep, dataValidForStep]);

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

    const currentStepIconStyle = Object.values(
      customStyle.currentStep.icon
    ).join(' ');

    if (!showPreStep && stepIdx === currentStep) {
      return (
        <div className={`is-flex ${stepClasses.join(' ')}`} key={stepIdx}>
          <div
            className={`rounded-full ${currentStepIconStyle} is-flex is-align-items-center is-justify-content-center`}
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
          <CheckMark
            circleFill={customStyle.completeStep.icon.hexBackgroundColor}
          />
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

  const getBackLabel = () => (
    <div
      className="is-flex is-align-items-center has-text-grey cursor-pointer"
      onClick={tryToGoBack}
    >
      <ArrowLeft />
      <span className="ml-4">Back</span>
    </div>
  );

  const _onSubmit = useCallback(
    () => onSubmit(stepsData),
    [onSubmit, stepsData]
  );

  const getNextButton = () => (
    <div className="my-6">
      <div
        className={`button is-block has-background-yellow rounded-sm py-2 px-4 has-text-centered ${
          !isStepValid && 'is-disabled'
        }`}
        onClick={tryToGoForward}
      >
        Next
      </div>
    </div>
  );

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

  return (
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
          {currentStep < steps.length - 1 && !passNextToComp && getNextButton()}
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
                ? { tryToGoForward }
                : undefined),
              ...(currentStep === steps.length - 1 && passSubmitToComp
                ? { onSubmit: _onSubmit }
                : undefined),
              ...(showPreStep ? { dismissPreStep } : undefined),
            })}
          <div className="is-hidden-tablet">
            {currentStep < steps.length - 1 &&
              !passNextToComp &&
              getNextButton()}
            {currentStep === steps.length - 1 &&
              !passSubmitToComp &&
              getSubmitButton()}
          </div>
        </div>
      </div>
    </section>
  );
}

export default StepByStep;
