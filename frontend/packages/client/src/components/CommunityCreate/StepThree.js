import React, { useState, useEffect } from 'react';
import { WrapperResponsive } from 'components';
import { isValidAddress } from 'utils';
import isNumber from 'lodash/isNumber';

// validate that proposalThreshold is a number higher than 0
const isValidThreSholdNumber = (proposalThreshold) => {
  const threshold = Number(proposalThreshold);
  if (isNumber(threshold)) {
    return threshold > 0;
  }
  return false;
};

export default function StepThree({
  stepData = {},
  setStepValid,
  onDataChange,
  onSubmit,
  isStepValid,
}) {
  const {
    proposalThreshold = '',
    contractAddress = '',
    contractName = '',
    storagePath = '',
    onlyAuthorsToSubmitProposals = true,
  } = stepData;

  const [authorCheckboxDisabled, setAuthorCheckboxDisabled] = useState(true);

  // If user opts to proceed without setting a proposal threshold
  // we should automatically mark the community as Authors Only possibly
  useEffect(() => {
    if (isValidThreSholdNumber(proposalThreshold) && authorCheckboxDisabled) {
      setAuthorCheckboxDisabled(false);
    }
    if (
      !onlyAuthorsToSubmitProposals &&
      !isValidThreSholdNumber(proposalThreshold)
    ) {
      setAuthorCheckboxDisabled(true);
      onDataChange({ onlyAuthorsToSubmitProposals: true });
    }
  }, [
    onlyAuthorsToSubmitProposals,
    proposalThreshold,
    setAuthorCheckboxDisabled,
    onDataChange,
  ]);

  useEffect(() => {
    const requiredFields = {
      contractAddress: (addr) =>
        addr?.trim().length > 0 ? isValidAddress(addr) : true,
      proposalThreshold: (threshold) =>
        threshold?.trim().length > 0 ? /^[0-9]+$/.test(threshold) : true,
      contractName: (name) =>
        name?.trim().length > 0 ? name?.trim().length <= 150 : true,
      storagePath: (path) =>
        path?.trim().length > 0 ? path?.trim().length <= 150 : true,
    };
    const isValid = Object.keys(requiredFields).every(
      (field) => stepData && requiredFields[field](stepData[field])
    );

    const threshold = Number(stepData?.proposalThreshold);

    if (
      isValid &&
      // anyone can submit: we need a threshold
      ((!onlyAuthorsToSubmitProposals &&
        isNumber(threshold) &&
        threshold > 0) ||
        // only autors can submit: ignore threshold it could be a number or empty
        onlyAuthorsToSubmitProposals)
    ) {
      setStepValid(true);
      return;
    }
    setStepValid(false);
  }, [stepData, setStepValid, onlyAuthorsToSubmitProposals]);

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
            disabled={authorCheckboxDisabled}
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
          style={{ height: 48, width: '100%' }}
          className={`button vote-button transition-all is-flex has-background-yellow rounded-sm is-enabled is-size-6 ${
            !isStepValid ? 'is-disabled' : ''
          }`}
          onClick={isStepValid ? () => onSubmit() : () => {}}
        >
          CREATE COMMUNITY
        </button>
      </div>
    </>
  );
}
