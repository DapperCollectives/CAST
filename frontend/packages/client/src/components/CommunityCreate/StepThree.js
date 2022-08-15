import React, { useEffect } from 'react';
import { WrapperResponsive } from 'components';
import { isValidAddress } from 'utils';

const { Schema } = stepThree;

export default function StepThree({
  stepData = {},
  onDataChange,
  moveToNextStep,
}) {
  const {
    proposalThreshold = '',
    contractAddress = '',
    contractName = '',
    storagePath = '',
    onlyAuthorsToSubmitProposals = false,
  } = stepData;

  const { isValidFlowAddress } = useWebContext();

  const { register, handleSubmit, formState } = useForm({
    resolver: yupResolver(Schema(isValidFlowAddress)),
    defaultValues: {
      proposalThreshold,
      contractAddress,
      contractName,
      storagePath,
      onlyAuthorsToSubmitProposals,
    },
  });
  const onSubmit = (data) => {
    onDataChange(data);
    moveToNextStep();
  };

  const { isDirty, isSubmitting, errors, isValid } = formState;

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
              Proposal threshold is the minimum number of tokens community
              members must hold in order to create a proposal.
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
          placeholder="Collection Public Path"
          name="collection_public_path"
          className="rounded-sm border-light p-3 column is-full is-full-mobile mt-4"
          value={storagePath}
          onChange={(event) =>
            onDataChange({ storagePath: event.target.value })
          }
        />
        <input
          type="text"
          placeholder="Number of Tokens"
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
            Allow only designated authors to submit proposals
          </p>
        </label>
      </WrapperResponsive>
      <div className="columns mb-5">
        <div className="column is-12">
          <button
            style={{ height: 48, width: '100%' }}
            className={`button vote-button is-flex has-background-yellow rounded-sm is-size-6 is-uppercase is-${
              isStepValid ? 'enabled' : 'disabled'
            }`}
            onClick={isStepValid ? () => moveToNextStep() : () => {}}
          >
            Next: VOTING STRATEGIES
          </button>
        </div>
      </div>
    </>
  );
}
