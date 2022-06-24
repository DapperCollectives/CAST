import React, { useEffect } from 'react';
import StrategySelectorForm from 'components/Community/StrategySelectorForm';
import { ActionButton } from 'components';

export default function StepFour({
  stepData,
  setStepValid,
  onDataChange,
  onSubmit,
  isStepValid,
} = {}) {
  const { strategies } = stepData || {};

  useEffect(() => {
    if (strategies.length > 1) {
      setStepValid(true);
    }
  }, [strategies, setStepValid]);

  return (
    <div>
      <StrategySelectorForm
        existingStrategies={strategies}
        disableAddButton={false}
        callToAction={(st) => {
          onDataChange({ strategies: st });
          return (
            <ActionButton
              label="save"
              enabled={isStepValid}
              onClick={isStepValid ? () => onSubmit() : () => {}}
              classNames="mt-5"
            />
          );
        }}
      />
      <div className="column p-0 is-12 mt-4">
        <button
          style={{ height: 48, width: '100%' }}
          className={`button vote-button transition-all is-flex has-background-yellow rounded-sm is-enabled is-size-6 ${
            !isStepValid ? 'is-disabled' : ''
          }`}
          onClick={isStepValid ? () => onSubmit() : () => {}}
        >
          CREATE COMMUNITY
        </button>
      </div>
    </div>
  );
}
