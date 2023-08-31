import { useForm } from 'react-hook-form';
import { useWebContext } from 'contexts/Web3';
import { ActionButton } from 'components';
import { yupResolver } from '@hookform/resolvers/yup';
import { getContractsAndPathsDataWithKeyValue } from 'data/dataServices.js';
import isEqual from 'lodash/isEqual';
import networks from 'networks';
import { Schema } from './FormConfig';
import ThresholdForm from './ThresholdForm';

const networkConfig = networks[process.env.REACT_APP_FLOW_ENV];

const { flowAddress } = networkConfig;

const defaultValues = {
  contractAddress: flowAddress.contractAddr,
  contractName: flowAddress.contractName,
  contractType: flowAddress.contractType,
  storagePath: flowAddress.storagePath,
  proposalThreshold: '0',
};

const checkFieldValues = ({
  contractAddress,
  contractName,
  contractType,
  storagePath,
  proposalThreshold,
  onlyAuthorsToSubmitProposals,
}) => {
  return (
    onlyAuthorsToSubmitProposals === true &&
    isEqual(defaultValues, {
      contractAddress,
      contractName,
      contractType,
      storagePath,
      proposalThreshold,
    })
  );
};

const checkIfNeedsDefaultValues = ({
  contractAddress: contractAddr,
  contractName,
  contractType,
  storagePath: publicPath,
  proposalThreshold,
  onlyAuthorsToSubmitProposals: onlyAuthorsToSubmit,
}) => {
  if (
    onlyAuthorsToSubmit &&
    [
      contractAddr,
      contractName,
      publicPath,
      proposalThreshold,
      contractType,
    ].every((field) => field === '')
  ) {
    return {
      contractAddr: defaultValues.contractAddress,
      contractName: defaultValues.contractName,
      contractType: defaultValues.contractType,
      publicPath: defaultValues.storagePath,
      proposalThreshold: defaultValues.proposalThreshold,
      onlyAuthorsToSubmit,
    };
  }
  return {
    contractAddr,
    contractName,
    contractType,
    publicPath,
    proposalThreshold,
    onlyAuthorsToSubmit,
  };
};

export default function ProposalThresholdEditor({
  updateCommunity = () => {},
  contractAddress,
  contractName,
  contractType,
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
    contractType,
    storagePath,
    proposalThreshold,
    onlyAuthorsToSubmitProposals,
  });

  const { control, register, handleSubmit, formState, reset, setValue } =
    useForm({
      resolver: yupResolver(Schema(isValidFlowAddress)),
      defaultValues: {
        ...(useEmptyFields
          ? {
              proposalThreshold: '',
              contractAddress: '',
              contractName: '',
              contractType: '',
              storagePath: '',
              contract: '',
            }
          : {
              proposalThreshold,
              contractAddress,
              contractName,
              contractType,
              storagePath,
              contract: getContractsAndPathsDataWithKeyValue(
                'contractAddress',
                contractAddress
              )?.contractName,
            }),
        onlyAuthorsToSubmitProposals,
      },
    });

  const onSubmit = async (data) => {
    // check fields value and pupulate them
    // with flow contract info if needed
    // if user leaves all fields empty and onlyAuthorsToSubmitProposals === true
    // the it adds Flow contract information
    const payload = checkIfNeedsDefaultValues(data);
    try {
      // onError hook from react-query will handle error
      await updateCommunity(payload);
    } catch (error) {
      return;
    }
    reset(data, { keepDirty: false });
  };

  const { isDirty, isSubmitting, errors } = formState;

  return (
    <ThresholdForm
      handleSubmit={handleSubmit(onSubmit)}
      errors={errors}
      register={register}
      control={control}
      isSubmitting={isSubmitting}
      setValue={setValue}
      submitComponent={
        <div className="columns mb-5">
          <div className="column is-12">
            <ActionButton
              type="submit"
              label="Save"
              enabled={isDirty && !isSubmitting}
              classNames="vote-button transition-all has-background-green mt-5"
            />
          </div>
        </div>
      }
    />
  );
}
