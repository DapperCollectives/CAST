import React, { useEffect } from 'react';
import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { useWebContext } from 'contexts/Web3';
import { useForm, useFieldArray } from 'react-hook-form';
import { useCommunityUsers } from 'hooks';
import AddressForm from './AddressForm';
import { ActionButton } from 'components';
import { AddressSchema } from './FormConfig';
import { yupResolver } from '@hookform/resolvers/yup';

export default function MembersEditor({
  title = 'Admins',
  description = '',
  addrType = 'Admin',
  communityId,
} = {}) {
  const {
    user: { addr },
    injectedProvider,
    isValidFlowAddress,
  } = useWebContext();
  const { notifyError } = useErrorHandlerContext();
  const {
    data: communityUsers,
    loading: loadingUsers,
    removeCommunityUsers,
    addCommunityUsers,
  } = useCommunityUsers({
    communityId,
    type: addrType.toLocaleLowerCase(),
    // if list goes up from 100 we need to add a fetch more button
    count: 100,
  });

  console.log((communityUsers ?? [])?.map((el) => ({ addr: el.addr })));

  const { register, control, handleSubmit, reset, formState } = useForm({
    mode: 'all',
    resolver: yupResolver(
      AddressSchema({ isValidFlowAddress, isEditMode: true })
    ),
  });

  const { isDirty, isSubmitting, errors, isValid } = formState;
  const {
    fields: addrList,
    append,
    remove,
    update,
  } = useFieldArray({
    control,
    name: 'addrList',
  });

  useEffect(() => {
    if (communityUsers?.length > 0) {
      reset({ addrList: communityUsers.map((el) => ({ addr: el.addr })) });
    }
  }, [communityUsers, reset]);

  const onSubmit = (data) => {
    console.log('data', data);
    // data.addrList.forEach((datum) => {
    //   console.log(datum.value);
    // });
  };
  return (
    <AddressForm
      submitComponent={
        <ActionButton
          type="submit"
          label="save"
          enabled={isDirty && !isSubmitting}
          loading={isSubmitting}
          classNames="vote-button transition-all has-background-yellow mt-5"
        />
      }
      title={title}
      description={description}
      loadingUsers={loadingUsers}
      addrList={addrList}
      onDeleteAddress={remove}
      onAddAddress={append}
      register={register}
      control={control}
      isValid={isValid}
      update={update}
      addrType={addrType}
      handleSubmit={handleSubmit(onSubmit)}
      errors={errors}
    />
  );
}
