import React, { useEffect } from "react";

export default function StepThree({
  stepData,
  setStepValid,
  onDataChange,
  onSubmit,
}) {
  const { proposalThreshold = "", contractAddress = "" } = stepData || {};

  useEffect(() => {
    return () => {
      setStepValid(true);
    };
  }, [stepData]);
  console.log("stepData", stepData);
  return (
    <div className="columns is-multiline border-light rounded-sm p-6">
      <div className="column is-12">
        <h4 className="has-text-weight-bold is-size-5">Proposal Threshold</h4>
      </div>
      <div className="column is-12 ">
        <p className="small-text has-text-grey">
          Proposal threshold is the minimum number of tokens required to create
          a proposal.
        </p>
      </div>
      <input
        type="text"
        placeholder="Contract Address"
        name="contract_address"
        className="rounded-sm border-light p-3 column is-full mt-2"
        value={contractAddress}
        onChange={(event) =>
          onDataChange({ contractAddress: event.target.value })
        }
      />
      <input
        type="text"
        placeholder="Proposal threshold"
        name="proposal_threshold"
        className="rounded-sm border-light p-3 column is-full mt-2"
        value={proposalThreshold}
        onChange={(event) =>
          onDataChange({ proposalThreshold: event.target.value })
        }
      />
      <label class="checkbox">
        <input type="checkbox" />I agree to the{" "}
        <a href="#">terms and conditions</a>
      </label>
      <div className="column is-12">
        <button
          style={{ height: 48, width: "100%" }}
          className="button vote-button transition-all is-flex has-background-yellow rounded-sm is-enabled is-size-6"
          onClick={() => {}}
        >
          GET STARTED
        </button>
      </div>
    </div>
  );
}
