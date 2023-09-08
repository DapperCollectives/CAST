import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useWebContext } from 'contexts/Web3';
import { ActionButton } from 'components';
import Input from 'components/common/Input';
import { IS_LOCAL_DEV } from 'const';
import { yupResolver } from '@hookform/resolvers/yup';
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

export default function StrategyInformationForm({
  formFields = [],
  formData = {},
  onSubmit = () => {},
  selectedProposalContract = {},
} = {}) {
  const { isValidFlowAddress } = useWebContext();
  const { register, handleSubmit, formState, setValue } = useForm({
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

  const setFormDetails = ({ contractName, contractAddress, publicPath }) => {
    setValue('name', contractName);
    setValue('addr', contractAddress);
    setValue('publicPath', publicPath);
  };

  const { isDirty, isSubmitting, errors, isValid } = formState;

  useEffect(() => {
    setFormDetails(selectedProposalContract);
  }, []);

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
