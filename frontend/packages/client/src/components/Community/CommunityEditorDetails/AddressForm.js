import React, { useEffect, useRef, useMemo } from 'react';
import { AddButton, Loader, WrapperResponsive } from 'components';
import FormFields from './FormFields';

export default function AddressForm({
  title,
  description,
  loadingUsers = false,
  addrList,
  errors,
  onDeleteAddress,
  onAddAddress,
  addrType = 'Admins',
  register,
  update,
  isValid,
  submitComponent,
  removeInnerForm,
  isSubmitting = false,
  handleSubmit,
  autoFocusOnLoad = false,
} = {}) {
  // const canDeleteAddress = addrList.length > 1;

  // const refOnFirstInput = useRef();

  // useEffect(() => {
  //   if (refOnFirstInput.current) {
  //     refOnFirstInput.current.focus();
  //   }
  // }, [refOnFirstInput]);

  const formFieldsComponent = useMemo(
    () => (
      <FormFields
        addrType={addrType}
        addrList={addrList}
        onDeleteAddress={onDeleteAddress}
        register={register}
        isValid={isValid}
        update={update}
        isSubmitting={isSubmitting}
        errors={errors}
      />
    ),
    [
      addrList,
      isSubmitting,
      errors,
      register,
      onDeleteAddress,
      update,
      isValid,
      addrType,
    ]
  );
  const addButtonComponent = useMemo(
    () => (
      <AddButton
        disabled={loadingUsers}
        addText={addrType}
        onAdd={onAddAddress}
        className="mt-2"
      />
    ),
    [loadingUsers, addrType, onAddAddress]
  );

  return (
    <div className="border-light rounded-lg columns is-flex-direction-column is-mobile m-0 p-6 mb-6 p-4-mobile mb-4-mobile">
      <div className="columns flex-1">
        <div className="column">
          <div className="is-flex flex-1">
            <WrapperResponsive
              tag="h5"
              classNames="title is-6 is-flex is-align-items-center"
              extraClassesMobile="mt-4"
            >
              {title}
            </WrapperResponsive>
          </div>
          <div className="is-flex flex-1 mt-5">
            <p className="has-text-grey small-text">{description}</p>
          </div>
        </div>
      </div>
      {loadingUsers && <Loader className="py-5" />}
      {removeInnerForm ? (
        <>
          {formFieldsComponent}
          {addButtonComponent}
        </>
      ) : (
        <form onSubmit={handleSubmit}>
          {formFieldsComponent}
          {addButtonComponent}
          {submitComponent}
        </form>
      )}
    </div>
  );
}
