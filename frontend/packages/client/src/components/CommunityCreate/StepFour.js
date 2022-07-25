import React, { useEffect } from 'react';
import StrategySelectorForm from 'components/Community/StrategySelectorForm';
import ActionButton from 'components/ActionButton';

export default function StepFour({
  stepData,
  setStepValid,
  onDataChange,
  onSubmit,
  isStepValid,
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
      existingStrategies={strategies}
      onStrategySelection={onStrategySelection}
      enableDelUniqueItem={true}
      callToAction={() => {
        return (
          <ActionButton
            label="CREATE COMMUNITY"
            enabled={isStepValid}
            onClick={isStepValid ? () => onSubmit() : () => {}}
            classNames="mt-5 has-button-border-hover"
          />
        );
      }}
    />
  );
}
