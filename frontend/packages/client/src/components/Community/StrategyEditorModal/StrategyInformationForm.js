import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useWebContext } from 'contexts/Web3';
import { ActionButton } from 'components';
import Dropdown from 'components/common/Dropdown';
import Input from 'components/common/Input';
import { IS_LOCAL_DEV } from 'const';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  getContractsAndPathsDataWithKeyValue,
  getContractsAndPathsDataWithType,
} from 'data/dataServices.js';
import { getSchema } from './FormConfig';

const AUTO_FILLED_FIELDS = ['addr', 'name', 'publicPath'];

const styles = {
  disableInputStyle: {
    backgroundColor: '#f5f5f5',
    color: '#777',
    border: '1px solid #ccc',
    cursor: 'not-allowed',
  },
};

const staticPlaceholders = {
  addr: 'Contract Address',
  name: 'Contract Name',
  publicPath: 'Collection Public Path',
  maxWeight: 'Max Weight',
  threshold: 'Minimum Balance',
  floatEventId: 'Event ID',
};

const getDropDownData = ({ strategyKey }) => {
  switch (strategyKey) {
    case 'balance-of-nfts': {
      return {
        dropDownData: getContractsAndPathsDataWithType('NFT')?.map((item) => {
          return {
            label: item.name,
            value: item.contractName,
          };
        }),
      };
    }
    case 'token-weighted-default':
    case 'total-token-weighted-default': {
      return {
        dropDownData: getContractsAndPathsDataWithType('TOKEN')?.map((item) => {
          return {
            label: item.name,
            value: item.contractName,
          };
        }),
      };
    }
    default:
      return {};
  }
};

export default function StrategyInformationForm({
  formFields = [],
  formData = {},
  onSubmit = () => {},
  strategy = {},
} = {}) {
  const [isDropDownVisible, setIsDropDownVisible] = useState(false);
  const [contractOptions, setContractOption] = useState([]);
  const { isValidFlowAddress } = useWebContext();
  const { register, handleSubmit, formState, control, setValue } = useForm({
    resolver: yupResolver(getSchema(formFields, isValidFlowAddress)),
    defaultValues: {
      ...formData,
      contract: '',
      ...(IS_LOCAL_DEV
        ? {
            addr: '0x0ae53cb6e3f42a79',
            name: 'FlowToken',
            threshold: '1',
            maxWeight: '2222',
            publicPath: 'flowTokenBalance',
          }
        : undefined),
    },
  });

  const { isDirty, isSubmitting, errors, isValid } = formState;
  const selectedContract = useWatch({ control, name: 'contract' });

  // On mount to see if a dropdown should be shown based on the type of strategy and if there's
  // data in the dropdown
  useEffect(() => {
    const { dropDownData = [] } = getDropDownData({
      strategyKey: strategy?.key,
    });

    if (dropDownData.length > 0) {
      setIsDropDownVisible(true);
      setContractOption(dropDownData);
    }
  }, []);

  useEffect(() => {
    // When there is no dropdown, the fields should be filled on component mount itself
    switch (strategy.key) {
      case 'staked-token-weighted-default': {
        const contract = getContractsAndPathsDataWithKeyValue(
          'contractName',
          'FlowToken'
        );
        setFormDetails(contract);
        break;
      }
      case 'float-nfts': {
        const contract = getContractsAndPathsDataWithKeyValue(
          'contractName',
          'FLOAT'
        );
        setFormDetails(contract);
        break;
      }
      default:
        break;
    }

    // When there's a dropdown and the user has selected one of the contract.
    if (selectedContract) {
      const contract = getContractsAndPathsDataWithKeyValue(
        'contractName',
        selectedContract
      );
      setFormDetails(contract);
    }
  }, [strategy, selectedContract]);

  const setFormDetails = ({ contractName, contractAddress, publicPath }) => {
    setValue('name', contractName);
    setValue('addr', contractAddress);
    setValue('publicPath', publicPath);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="columns is-flex-direction-column is-mobile m-0">
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
        {isDropDownVisible ? (
          <Dropdown
            register={register}
            label="Select Contract"
            name="contract"
            margin="mt-4"
            options={contractOptions}
            disabled={isSubmitting}
            control={control}
          />
        ) : null}

        {formFields.map((field, index) => {
          const isReadOnly = AUTO_FILLED_FIELDS.includes(field);
          return (
            <Input
              key={index}
              readOnly={isReadOnly}
              style={isReadOnly ? styles.disableInputStyle : {}}
              placeholder={staticPlaceholders[field]}
              name={field}
              register={register}
              error={errors[field]}
              disabled={isSubmitting}
              classNames="rounded-sm border-light p-3 column is-full is-full-mobile mt-4"
            />
          );
        })}
      </div>
      <ActionButton
        type="submit"
        label="Done"
        enabled={(isDirty || isValid) && !isSubmitting}
        loading={isSubmitting}
        classNames="mt-5 has-button-border-hover"
      />
    </form>
  );
}
