import classnames from 'classnames';
import StepNumber from './StepNumber';

const StepLabelAndIcon = ({
  stepIdx,
  stepLabel,
  currentStep,
  disableAll,
  moveToStep,
  validatedSteps,
  navigationEnabled = true,
}) => {
  // Calculated Status
  const isActive = stepIdx === currentStep;
  const isDone = currentStep > stepIdx;
  const isPending = !isActive && !isDone;

  const statusText = {
    1: 'pending',
    2: 'active',
    3: 'done',
  };

  let status = statusText[(isPending && 1) || (isActive && 2) || (isDone && 3)];

  // Imperative status
  if (disableAll) {
    status = statusText[1];
  }

  // this enabled showing higher steps already submitted to have green check
  if (validatedSteps?.[stepIdx] && !isActive) {
    status = statusText[3];
  }

  // if current step is not valid do not allow navitation
  // out to anther step until current step is valid
  const enableNavigation =
    status === statusText[3] &&
    navigationEnabled &&
    Object.values(validatedSteps)
      // remove last element since could be false
      .slice(0, Object.values(validatedSteps).length - 1)
      .every((e) => e !== false);

  const stepClasses = classnames(
    'is-flex p-1 is-align-items-center rounded-xl mb-4 medium-text',
    { 'has-text-grey': status === statusText[1] },
    {
      'has-background-grey-lighter has-text-weight-bold has-text-black':
        status === statusText[2] || stepIdx === currentStep,
    },
    {
      'cursor-pointer': enableNavigation,
    }
  );

  return (
    <div
      className={stepClasses}
      key={stepIdx}
      onClick={enableNavigation ? () => moveToStep(stepIdx) : () => {}}
      style={!navigationEnabled ? { cursor: 'no-drop' } : {}}
    >
      <StepNumber stepIdx={stepIdx} status={status} />
      {stepLabel ? <span className="ml-4">{stepLabel}</span> : null}
    </div>
  );
};

export default StepLabelAndIcon;
