import React from 'react';
import { useForm } from 'react-hook-form';
import { useWebContext } from 'contexts/Web3';
import { ActionButton } from 'components';
import { yupResolver } from '@hookform/resolvers/yup';
import isEqual from 'lodash/isEqual';
import networks from 'networks';
import { Schema } from './FormConfig';
import ThresholdForm from './ThresholdForm';

const networkConfig = networks[process.env.REACT_APP_FLOW_ENV];

const { flowAddress } = networkConfig;

const defaultValues = {
  contractAddress: flowAddress.contractAddr,
  contractName: flowAddress.contractName,
  storagePath: flowAddress.storagePath,
  proposalThreshold: '0',
};

const checkFieldValues = ({
  contractAddress,
  contractName,
  storagePath,
  proposalThreshold,
  onlyAuthorsToSubmitProposals,
}) => {
  return (
    onlyAuthorsToSubmitProposals === true &&
    isEqual(defaultValues, {
      contractAddress,
      contractName,
      storagePath,
      proposalThreshold,
    })
  );
};

const checkIfNeedsDefaultValues = ({
  contractAddress: contractAddr,
  contractName,
  storagePath: publicPath,
  proposalThreshold,
  onlyAuthorsToSubmitProposals: onlyAuthorsToSubmit,
}) => {
  if (
    onlyAuthorsToSubmit &&
    [contractAddr, contractName, publicPath, proposalThreshold].every(
      (field) => field === ''
    )
  ) {
    return {
      contractAddr: defaultValues.contractAddress,
      contractName: defaultValues.contractName,
      publicPath: defaultValues.storagePath,
      proposalThreshold: defaultValues.proposalThreshold,
      onlyAuthorsToSubmit,
    };
  }
  return {
    contractAddr,
    contractName,
    publicPath,
    proposalThreshold,
    onlyAuthorsToSubmit,
  };
};

export default function ProposalThresholdEditor({
  updateCommunity = () => {},
  contractAddress,
  contractName,
  storagePath,
  proposalThreshold,
  onlyAuthorsToSubmitProposals,
}) {
  const { isValidFlowAddress } = useWebContext();

  // if flow contract information was used and
  // onlyAuthorsToSubmitProposals === true then do not show contract information
  // if was left in black when community was created and frontend completed
  // the request with Flow contract information
  const useEmptyFields = checkFieldValues({
    contractAddress,
    contractName,
    storagePath,
    proposalThreshold,
    onlyAuthorsToSubmitProposals,
  });

  const { register, handleSubmit, formState, reset } = useForm({
    resolver: yupResolver(Schema(isValidFlowAddress)),
    defaultValues: {
      ...(useEmptyFields
        ? {
            proposalThreshold: '',
            contractAddress: '',
            contractName: '',
            storagePath: '',
          }
        : { proposalThreshold, contractAddress, contractName, storagePath }),
      onlyAuthorsToSubmitProposals,
    },
  });

  const onSubmit = async (data) => {
    // check fields value and pupulate them
    // with flow contract info if needed
    // if user leaves all fields empty and onlyAuthorsToSubmitProposals === true
    // the it adds Flow contract information
    const payload = checkIfNeedsDefaultValues(data);
    await updateCommunity(payload);

    reset(data, { keepDirty: false });
  };

  const { isDirty, isSubmitting, errors } = formState;

  return (
    <ThresholdForm
      handleSubmit={handleSubmit(onSubmit)}
      errors={errors}
      register={register}
      isSubmitting={isSubmitting}
      submitComponent={
        <div className="columns mb-5">
          <div className="column is-12">
            <ActionButton
              type="submit"
              label="Next: VOTING STRATEGIES"
              enabled={isDirty && !isSubmitting}
              classNames="vote-button transition-all has-background-yellow mt-5"
            />
          </div>
        </div>
      }
    />
  );
}
