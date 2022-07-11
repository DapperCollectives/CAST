import React, { useEffect } from 'react';
import { WrapperResponsive } from 'components';
import { isValidAddress } from 'utils';

const allEmptyFields = (data) => {
  // all fields are undefined: form untouched or empty strings
  const fields = [
    'contractAddress',
    'contractName',
    'storagePath',
    'proposalThreshold',
  ];
  return (
    fields.every((field) => data[field] === undefined) ||
    fields.every((field) => data[field] === '')
  );
};
const allFieldsFilled = (data) => {
  // all fields have data and are not empty strings: form touched
  return [
    'contractAddress',
    'contractName',
    'storagePath',
    'proposalThreshold',
  ].every((field) => data[field] !== undefined && data[field] !== '');
};
export default function StepThree({
  stepData = {},
  setStepValid,
  onDataChange,
  isStepValid,
  tryToGoForward,
}) {
  const {
    proposalThreshold = '',
    contractAddress = '',
    contractName = '',
    storagePath = '',
    onlyAuthorsToSubmitProposals = false,
  } = stepData;

  useEffect(() => {
    const requiredFields = {
      contractAddress: (addr) =>
        addr?.trim().length > 0 ? isValidAddress(addr) : true,
      contractName: (name) =>
        name?.trim().length > 0 ? name?.trim().length <= 150 : true,
      storagePath: (path) =>
        path?.trim().length > 0 ? path?.trim().length <= 150 : true,
      proposalThreshold: (threshold) =>
        threshold?.trim().length > 0 ? /^[0-9]+$/.test(threshold) : true,
    };

    const isValid =
      Object.keys(requiredFields).every(
        (field) => stepData && requiredFields[field](stepData[field])
      ) &&
      // only autors can submit, Ignore all other fields they must be empty
      ((allEmptyFields(stepData) && onlyAuthorsToSubmitProposals) ||
        // all fields are complete with valid data
        // (onlyAuthorsToSubmitProposals could be checked or not)
        allFieldsFilled(stepData));

    setStepValid(isValid);
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

        <label className="checkbox column is-flex is-align-items-center is-full is-full-mobile px-0 mt-4 mb-4">
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
      <div className="columns mb-5">
        <div className="column is-12">
          <button
            style={{ height: 48, width: '100%' }}
            className={`button vote-button transition-all is-flex has-background-yellow rounded-sm is-size-6 is-uppercase is-${
              isStepValid ? 'enabled' : 'disabled'
            }`}
            onClick={isStepValid ? () => tryToGoForward() : () => {}}
          >
            Next: VOTING STRATEGIES
          </button>
        </div>
      </div>
    </>
  );
}
