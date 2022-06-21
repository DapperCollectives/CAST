import React from "react";

export default function StepFour({
  stepData,
  setStepValid,
  onDataChange,
  onSubmit,
  isStepValid,
} = {}) {
  const { strategies } = stepData || {};

  return (
    <div>
      StepFour
      <div className="column p-0 is-12 mt-4">
        <button
          style={{ height: 48, width: "100%" }}
          className={`button vote-button transition-all is-flex has-background-yellow rounded-sm is-enabled is-size-6 ${
            !isStepValid ? "is-disabled" : ""
          }`}
          onClick={isStepValid ? () => onSubmit() : () => {}}
        >
          CREATE COMMUNITY
        </button>
      </div>
    </div>
  );
}
