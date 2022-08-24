import React from 'react';
import { useForm } from 'react-hook-form';
import { useWebContext } from 'contexts/Web3';
import { ActionButton } from 'components';
import Input from 'components/common/Input';
import { yupResolver } from '@hookform/resolvers/yup';
import { getSchema } from './FormConfig';

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
} = {}) {
  const { isValidFlowAddress } = useWebContext();
  const { register, handleSubmit, formState } = useForm({
    resolver: yupResolver(getSchema(formFields, isValidFlowAddress)),
    defaultValues: {
      ...formData,
    },
  });

  const { isDirty, isSubmitting, errors, isValid } = formState;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="columns is-flex-direction-column is-mobile m-0">
        <div className="small-text" style={{ color: '#757575' }}>
          Need help finding this information?{' '}
          <a
            href="https://docs.cast.fyi"
            target="_blank"
            rel="noopener noreferrer"
          >
            Check our Getting Started Guide.
          </a>
        </div>
        {formFields.map((field, index) => (
          <Input
            key={index}
            placeholder={staticPlaceholders[field]}
            name={field}
            register={register}
            error={errors[field]}
            disabled={isSubmitting}
            classNames="rounded-sm border-light p-3 column is-full is-full-mobile mt-4"
          />
        ))}
      </div>
      <ActionButton
        type="submit"
        label="done"
        enabled={(isDirty || isValid) && !isSubmitting}
        loading={isSubmitting}
        classNames="mt-5 has-button-border-hover"
      />
    </form>
  );
}
