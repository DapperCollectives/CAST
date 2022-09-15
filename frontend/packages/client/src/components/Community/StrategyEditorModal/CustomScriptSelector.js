import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ActionButton } from 'components';
import Input from 'components/common/Input';
import { yupResolver } from '@hookform/resolvers/yup';
import { getCustomScriptSchema } from './FormConfig';

const CustomScriptSteps = {
  1: 'select-script',
  2: 'script-information',
};

const staticPlaceholders = {
  maxWeight: 'Max Weight',
  threshold: 'Minimum Balance',
};

export default function CustomScriptSelector({
  scripts = [],
  formFields = [],
  formData = {},
  onSubmit = () => {},
} = {}) {
  const [step, setStep] = useState(CustomScriptSteps[1]);
  const [script, setScript] = useState();
  const { register, handleSubmit, formState } = useForm({
    resolver: yupResolver(getCustomScriptSchema()),
    defaultValues: {
      ...formData,
    },
  });

  const { isDirty, isSubmitting, errors, isValid } = formState;

  const handleSelectScript = (script) => {
    setScript(script);
    setStep(CustomScriptSteps[2]);
  };

  const onDone = (values) => {
    // Inject script and unused fields
    // into contract data
    onSubmit({
      ...values,
      script: script.key,
      addr: '',
      name: '',
      publicPath: '',
    });
  };

  return step === CustomScriptSteps[1] ? (
    <div
      className="is-flex is-flex-direction-column flex-1"
      style={{ minHeight: '280px' }}
    >
      {scripts.map((script, index) => {
        return (
          <div
            key={`${script.key}`}
            className="border-light rounded-sm is-flex is-flex-direction-column is-justify-content-center mb-4 py-4 px-3 cursor-pointer strategy-selector transition-all"
            style={{ minHeight: '99px' }}
            onClick={() => handleSelectScript(script)}
          >
            <div className="columns is-multiline">
              <div className="column is-12 pb-2">
                <p style={{ textTransform: 'capitalize' }}>{script.name}</p>
              </div>
              <div className="column is-12 pt-2">
                <p className="small-text has-text-grey">{script.description}</p>
              </div>
            </div>
          </div>
        );
      })}
      {scripts.length === 0 && (
        <div className="is-flex is-flex-direction-column is-justify-content-center is-align-items-center flex-1">
          <p className="small-text has-text-grey">No scripts are available.</p>
        </div>
      )}
    </div>
  ) : (
    <form onSubmit={handleSubmit(onDone)}>
      <div className="columns is-flex-direction-column is-mobile m-0">
        <div className="small-text" style={{ color: '#757575' }}>
          <div>
            {script.name}: {script.description}
          </div>
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
        label="Done"
        enabled={(isDirty || isValid) && !isSubmitting}
        loading={isSubmitting}
        classNames="mt-5 has-button-border-hover"
      />
    </form>
  );
}
