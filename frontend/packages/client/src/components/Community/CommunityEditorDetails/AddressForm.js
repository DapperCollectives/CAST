import React, { useCallback, useMemo } from 'react';
import { AddButton, Loader, WrapperResponsive } from 'components';
import pick from 'lodash/pick';
import FormFields from './FormFields';

export default function AddressForm({
  loadingUsers = false,
  addrType = 'Admins',
  submitComponent,
  removeInnerForm,
  isSubmitting = false,
  handleSubmit,
  ...props
} = {}) {
  const { title, description } = pick(props, ['title', 'description']);
  const {
    addrList,
    listName,
    errors,
    onDeleteAddress,
    onAddAddress,
    register,
    update,
    isValid,
  } = pick(props, [
    'addrList',
    'listName',
    'errors',
    'onDeleteAddress',
    'onAddAddress',
    'register',
    'update',
    'isValid',
  ]);

  const onClearField = useCallback(
    (index) => {
      update(index, { addr: '' });
    },
    [update]
  );

  const formFieldsComponent = useMemo(
    () => (
      <FormFields
        label="Flow wallet address"
        addrType={addrType}
        addrList={addrList}
        listName={listName}
        onDeleteAddress={onDeleteAddress}
        register={register}
        isValid={isValid}
        update={update}
        isSubmitting={isSubmitting}
        errors={errors}
        onClearField={onClearField}
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
      listName,
      onClearField,
    ]
  );
  const addButtonComponent = useMemo(
    () => (
      <AddButton
        disabled={loadingUsers}
        addText={addrType}
        onAdd={() => onAddAddress({ addr: '' })}
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
