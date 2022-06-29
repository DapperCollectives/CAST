import React from 'react';
import StrategySelectorForm from 'components/Community/StrategySelectorForm';
import ActionButton from 'components/ActionButton';
import { mapFieldsForBackend } from '../Community/CommunityPropsAndVoting';

export default function StepFour({
  stepData,
  setStepValid,
  onDataChange,
  onSubmit,
  isStepValid,
} = {}) {
  const { strategies } = stepData || {};

  const onStrategySelection = (strategies) => {
    if (strategies.length > 0) {
      setStepValid(true);
    } else {
      setStepValid(false);
    }
    onDataChange({
      strategies: strategies.map((st) => ({
        name: st.name,
        contract: mapFieldsForBackend(st.contract),
      })),
    });
  };

  return (
    <StrategySelectorForm
      existingStrategies={strategies}
      onStrategySelection={onStrategySelection}
      callToAction={() => {
        return (
          <ActionButton
            label="CREATE COMMUNITY"
            enabled={isStepValid}
            onClick={isStepValid ? () => onSubmit() : () => {}}
            classNames="mt-5"
          />
        );
      }}
    />
  );
}
