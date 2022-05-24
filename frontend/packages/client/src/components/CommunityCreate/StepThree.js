import React, { useEffect } from "react";
import { WrapperResponsive } from "components";

export default function StepThree({
  stepData,
  setStepValid,
  onDataChange,
  onSubmit,
  isStepValid,
}) {
  const {
    proposalThreshold = "",
    contractAddress = "",
    contractName = "",
    storagePath = "",
    onlyAuthorsToSubmitProposals = false,
  } = stepData || {};

  useEffect(() => {
    const requiredFields = {
      // not currently used
      // contractAddress: (addr) => addr?.trim().length > 0,
      proposalThreshold: (threshold) =>
        threshold?.trim().length > 0 && /^[0-9]+$/.test(threshold),
    };
    const isValid = Object.keys(requiredFields).every(
      (field) => stepData && requiredFields[field](stepData[field])
    );
    setStepValid(isValid);
  }, [stepData, setStepValid]);
  return (
    <>
      <WrapperResponsive
        classNames="border-light rounded-lg columns is-flex-direction-column is-mobile m-0"
        extraClasses="p-6 mb-5"
        extraClassesMobile="p-4 mb-4"
      >
        <div className="columns is-multiline">
          <div className="column is-12">
            <h4 className="has-text-weight-bold is-size-5">
              Proposal Threshold
            </h4>
          </div>
          <div className="column is-12">
            <p className="small-text has-text-grey">
              Proposal threshold is the minimum number of tokens required to
              create a proposal.
            </p>
          </div>
        </div>
        <input
          type="text"
          placeholder="Contract Address"
          name="contract_address"
          className="rounded-sm border-light p-3 column is-full is-full-mobile mt-4"
          value={contractAddress}
          onChange={(event) =>
            onDataChange({ contractAddress: event.target.value })
          }
        />
        <input
          type="text"
          placeholder="Contract Name"
          name="contract_name"
          className="rounded-sm border-light p-3 column is-full is-full-mobile mt-4"
          value={contractName}
          onChange={(event) =>
            onDataChange({ contractName: event.target.value })
          }
        />
        <input
          type="text"
          placeholder="Storage Path"
          name="storage_path"
          className="rounded-sm border-light p-3 column is-full is-full-mobile mt-4"
          value={storagePath}
          onChange={(event) =>
            onDataChange({ storagePath: event.target.value })
          }
        />
        <input
          type="text"
          placeholder="Proposal threshold"
          name="proposal_threshold"
          className="rounded-sm border-light p-3 column is-full is-full-mobile mt-4"
          value={proposalThreshold}
          onChange={(event) =>
            onDataChange({ proposalThreshold: event.target.value })
          }
        />

        <label className="checkbox column is-flex is-align-items-center is-full is-full-mobile px-0 mt-4">
          <input
            type="checkbox"
            className="mr-2 form-checkbox"
            checked={onlyAuthorsToSubmitProposals}
            onChange={(e) => {
              onDataChange({
                onlyAuthorsToSubmitProposals: !onlyAuthorsToSubmitProposals,
              });
            }}
          />
          <p className="has-text-grey small-text">
            Allow only authors to submit a proposal
          </p>
        </label>
      </WrapperResponsive>
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
    </>
  );
}
