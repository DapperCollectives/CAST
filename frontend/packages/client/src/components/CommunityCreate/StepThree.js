import { useForm } from 'react-hook-form';
import { useWebContext } from 'contexts/Web3';
import { ActionButton } from 'components';
import { ThresholdForm } from 'components/Community/ProposalThresholdEditor';
import { yupResolver } from '@hookform/resolvers/yup';
import { getContractsAndPathsDataWithKeyValue } from 'data/dataServices.js';
import { stepThree } from './FormConfig';

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
    contractType = '',
    storagePath = '',
    onlyAuthorsToSubmitProposals = false,
  } = stepData;

  const { isValidFlowAddress } = useWebContext();

  const { control, register, handleSubmit, formState, setValue } = useForm({
    resolver: yupResolver(Schema(isValidFlowAddress)),
    defaultValues: {
      contract:
        getContractsAndPathsDataWithKeyValue('contractAddress', contractAddress)
          ?.contractName ?? '',
      proposalThreshold,
      contractAddress,
      contractName,
      contractType,
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
    <ThresholdForm
      setValue={setValue}
      handleSubmit={handleSubmit(onSubmit)}
      errors={errors}
      register={register}
      control={control}
      isSubmitting={isSubmitting}
      submitComponent={
        <div className="columns mb-5">
          <div className="column is-12">
            <ActionButton
              type="submit"
              label="Next: Voting Strategies"
              enabled={(isValid || isDirty) && !isSubmitting}
              classNames="vote-button transition-all has-background-green mt-5"
            />
          </div>
        </div>
      }
    />
  );
}
