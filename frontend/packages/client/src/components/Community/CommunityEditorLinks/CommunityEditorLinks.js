import React from 'react';

import { WrapperResponsive, ActionButton } from 'components';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormFieldsConfig, Schema } from './FormFields';
import EditorForm from './EditorForm';

export const CommunityLinksForm = ({
  formFields = FormFieldsConfig,
  submitComponent,
  onChangeHandler,
  fields,
  isUpdating = false,
  wrapperMargin = 'mb-6',
  wrapperMarginMobile = 'mb-4',
}) => {
  return (
    <WrapperResponsive
      classNames="border-light rounded-lg columns is-flex-direction-column is-mobile m-0"
      extraClasses={`p-6 ${wrapperMargin}`}
      extraClassesMobile={`p-4 ${wrapperMarginMobile}`}
    >
      <div className="columns flex-1">
        <div className="column">
          <div className="is-flex flex-1">
            <WrapperResponsive
              tag="h5"
              classNames="title is-6 mb-2"
              extraClassesMobile="mt-4"
            >
              Community Links
            </WrapperResponsive>
          </div>
          <div className="is-flex flex-1 mt-5">
            <p className="has-text-grey small-text">
              Let’s fill out your Community profile. These details will be
              publicly available and will help people know what your community
              is all about.
            </p>
          </div>
        </div>
      </div>
      {formFields.map((formField, index) => (
        <div
          style={{ position: 'relative' }}
          className="is-flex is-align-items-center mt-4"
          key={`form-field-${index}`}
        >
          <input
            type="text"
            name={formField.fieldName}
            className="rounded-sm border-light py-3 pr-3 column is-full"
            placeholder={formField?.placeholder}
            value={fields[formField.fieldName]}
            maxLength={200}
            onChange={(event) =>
              onChangeHandler(formField.fieldName)(event.target.value)
            }
            style={{
              paddingLeft: '34px',
            }}
            disabled={isUpdating}
          />
          <div
            className="pl-3"
            style={{
              position: 'absolute',
              height: 18,
              opacity: 0.3,
            }}
          >
            {formField.iconComponent}
          </div>
        </div>
      ))}
      {submitComponent}
    </WrapperResponsive>
  );
};

export default function CommunityEditorLinks(props = {}) {
  const { updateCommunity, ...fields } = props;
  const {
    websiteUrl = '',
    twitterUrl = '',
    instagramUrl = '',
    discordUrl = '',
    githubUrl = '',
  } = fields;

  const { register, handleSubmit, formState } = useForm({
    defaultValues: {
      websiteUrl,
      twitterUrl,
      instagramUrl,
      discordUrl,
      githubUrl,
    },
    resolver: yupResolver(Schema),
  });

  const { errors, isSubmitting, isDirty, isValid } = formState;

  const onSubmit = async (data) => {
    await updateCommunity(data);
  };

  return (
    <EditorForm
      submitComponent={
        <ActionButton
          label="save"
          enabled={isValid && isDirty && !isSubmitting}
          loading={isSubmitting}
          classNames="vote-button transition-all has-background-yellow mt-5"
        />
      }
      errors={errors}
      register={register}
      isSubmitting={isSubmitting}
      handleSubmit={handleSubmit(onSubmit)}
    />
  );
}
