import { useEffect } from 'react';
import ActionButton from 'components/ActionButton';
import StrategySelectorForm from 'components/Community/StrategySelectorForm';

export default function StepFour({
  stepData,
  setStepValid,
  onDataChange,
  onSubmit,
  isStepValid,
  selectedProposalContract = {},
} = {}) {
  const { strategies } = stepData || {};

  useEffect(() => {
    if (strategies?.length > 0) {
      setStepValid(true);
    } else {
      setStepValid(false);
    }
  }, [strategies, setStepValid]);

  const onStrategySelection = (strategies) => {
    onDataChange({ strategies });
  };

  return (
    <StrategySelectorForm
      selectedProposalContract={selectedProposalContract}
      existingStrategies={strategies}
      onStrategySelection={onStrategySelection}
      enableDelUniqueItem
      callToAction={() => {
        return (
          <ActionButton
            label="Create Community"
            enabled={isStepValid}
            onClick={isStepValid ? () => onSubmit() : () => {}}
            classNames="mt-5 has-button-border-hover"
          />
        );
      }}
    />
  );
}
