import React from 'react';
import { Form, WrapperResponsive } from 'components';
import { FormFieldsConfig } from './FormConfig';
import FormFields from './FormFields';

export default function EditorForm({
  formFields = FormFieldsConfig,
  submitComponent,
  wrapperMargin = 'mb-6',
  wrapperMarginMobile = 'mb-4',
  register,
  errors,
  isSubmitting,
  removeInnerForm,
  handleSubmit = () => {},
} = {}) {
  const formFieldsComponent = (
    <FormFields
      formFields={formFields}
      register={register}
      isSubmitting={isSubmitting}
      errors={errors}
    />
  );
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
      {removeInnerForm ? (
        <>{formFieldsComponent}</>
      ) : (
        <Form methods={{ register }} handleSubmit={handleSubmit}>
          {formFieldsComponent}
          {submitComponent}
        </Form>
      )}
    </WrapperResponsive>
  );
}
