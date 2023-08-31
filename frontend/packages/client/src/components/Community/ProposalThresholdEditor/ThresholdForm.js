import { Fragment, useEffect, useRef } from 'react';
import { useWatch } from 'react-hook-form';
import { WrapperResponsive } from 'components';
import Checkbox from 'components/common/Checkbox';
import Dropdown from 'components/common/Dropdown';
import Form from 'components/common/Form';
import Input from 'components/common/Input';
import {
  getContractsAndPathsDataWithKeyValue,
  getContractsAndPathsDataWithType,
} from 'data/dataServices.js';

const styles = {
  disableInputStyle: {
    backgroundColor: '#f5f5f5',
    color: '#777',
    border: '1px solid #ccc',
    cursor: 'not-allowed',
  },
};

const CONTRACT_TYPES = [
  {
    label: 'Default: FLOW',
    value: '',
  },
  {
    label: 'NFT',
    value: 'nft',
  },
  {
    label: 'Fungible Token',
    value: 'ft',
  },
];

const getContractOptions = (type) => {
  const contractsData = getContractsAndPathsDataWithType(type);
  return contractsData.map((item) => {
    return {
      label: item.name,
      value: item.contractName,
    };
  });
};

export default function ThresholdForm({
  removeInnerForm = false,
  handleSubmit = () => {},
  submitComponent = null,
  errors = [],
  register = () => {},
  control = () => {},
  isSubmitting = false,
  setValue,
} = {}) {
  const contractType = useWatch({ control, name: 'contractType' });
  const contractSelected = useWatch({ control, name: 'contract' });
  const contractAddress = useWatch({ control, name: 'contractAddress' });

  const isFirstRender = useRef(true);

  // We are doing this because on mounting we don't want this contract value to be set to empty.
  // This will resolve the case where a user is editing the Proposal Threshold in community settings and he/she wants
  // the pre-selected values to populate.
  useEffect(() => {
    if (!isFirstRender.current) {
      // This is done to unSelect the contract if ther user selects another contractTypes
      setValue('contract', '');
    } else {
      isFirstRender.current = false;
    }
  }, [contractType]);

  // If the user selects any contract, the fields should auto populate
  useEffect(() => {
    if (contractType !== '' && !contractSelected) {
      setContractDetails({
        contractAddress: '',
        contractName: '',
        publicPath: '',
      });
    } else {
      const contractDetails = getContractsAndPathsDataWithKeyValue(
        'contractName',
        contractSelected ? contractSelected : 'FlowToken'
      );
      setContractDetails(contractDetails);
    }
  }, [contractSelected, contractType]);

  const setContractDetails = ({
    contractAddress,
    contractName,
    publicPath,
  }) => {
    setValue('contractAddress', contractAddress);
    setValue('contractName', contractName);
    setValue('storagePath', publicPath);
  };

  return (
    <Form removeInnerForm={removeInnerForm} onSubmit={handleSubmit}>
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
        <div className="small-text has-text-grey">
          Need help finding this information?{' '}
          <a
            href="https://dapper-collectives-1.gitbook.io/cast-docs/working-with-contracts-and-paths"
            target="_blank"
            rel="noopener noreferrer"
          >
            Check our Getting Started Guide.
          </a>
        </div>
        <Dropdown
          label="Default: FLOW"
          name="contractType"
          margin="mt-4"
          options={CONTRACT_TYPES}
          disabled={isSubmitting}
          control={control}
        />
        {/* Render only if a contract type is selected */}
        {contractType && (
          <Dropdown
            register={register}
            label="Select Contract"
            name="contract"
            margin="mt-4"
            options={getContractOptions(
              contractType === 'ft' ? 'TOKEN' : 'NFT'
            )}
            disabled={isSubmitting}
            control={control}
          />
        )}
        {/* Render only if a particular contract is selected */}
        <Fragment>
          <Input
            placeholder="Contract Address"
            register={register}
            name="contractAddress"
            disabled={isSubmitting}
            readOnly={true}
            style={styles.disableInputStyle}
            error={errors['contractAddress']}
            classNames="rounded-sm border-light p-3 column is-full is-full-mobile mt-4"
          />
          <Input
            placeholder="Contract Name"
            register={register}
            name="contractName"
            readOnly={true}
            style={styles.disableInputStyle}
            disabled={isSubmitting}
            error={errors['contractName']}
            classNames="rounded-sm border-light p-3 column is-full is-full-mobile mt-4"
          />
          <Input
            placeholder="Collection Public Path"
            name="storagePath"
            register={register}
            readOnly={true}
            style={styles.disableInputStyle}
            disabled={isSubmitting}
            error={errors['storagePath']}
            classNames="rounded-sm border-light p-3 column is-full is-full-mobile mt-4"
          />
          <Input
            placeholder="Number of Tokens"
            name="proposalThreshold"
            register={register}
            disabled={isSubmitting}
            error={errors['proposalThreshold']}
            classNames="rounded-sm border-light p-3 column is-full is-full-mobile mt-4"
          />
          <Checkbox
            type="checkbox"
            name="onlyAuthorsToSubmitProposals"
            register={register}
            disabled={isSubmitting}
            error={errors['onlyAuthorsToSubmitProposals']}
            label="Allow only designated authors to submit proposals"
            labelClassNames="has-text-grey small-text"
          />
        </Fragment>
      </WrapperResponsive>
      {submitComponent}
    </Form>
  );
}
