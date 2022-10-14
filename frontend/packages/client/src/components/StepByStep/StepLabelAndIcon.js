import classnames from 'classnames';
import StepNumber from './StepNumber';

const StepLabelAndIcon = ({ stepIdx, stepLabel, showPreStep, currentStep }) => {
  const isActiveStep = !showPreStep && stepIdx === currentStep;
  const isDoneStep = !showPreStep && currentStep > stepIdx;
  const isPendingStep = !isActiveStep && !isDoneStep;

  const stepClasses = classnames(
    'is-flex p-1 is-align-items-center rounded-xl mb-4 medium-text',
    {
      'has-background-grey-lighter has-text-weight-bold has-text-black':
        isActiveStep,
    },
    { 'has-text-grey': isPendingStep || isDoneStep }
  );

  const statusText = {
    1: 'pending',
    2: 'active',
    3: 'done',
  };

  const status =
    statusText[
      (isPendingStep && 1) || (isActiveStep && 2) || (isDoneStep && 3)
    ];

  return (
    <div className={stepClasses} key={stepIdx}>
      <StepNumber stepIdx={stepIdx} status={status} />
      {stepLabel ? <span className="ml-4">{stepLabel}</span> : null}
    </div>
  );
};

export default StepLabelAndIcon;
