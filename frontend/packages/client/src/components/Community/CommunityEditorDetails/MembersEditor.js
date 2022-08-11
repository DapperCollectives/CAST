import React, { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { useWebContext } from 'contexts/Web3';
import { ActionButton } from 'components';
import { useCommunityUsers } from 'hooks';
import { getCompositeSigs } from 'utils';
import { yupResolver } from '@hookform/resolvers/yup';
import AddressForm from './AddressForm';
import { AddressSchema } from './FormConfig';

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

  // load from api existing addresses
  useEffect(() => {
    if (communityUsers?.length > 0) {
      reset({ addrList: communityUsers.map((el) => ({ addr: el.addr })) });
    }
  }, [communityUsers, reset]);

  const onSubmit = async (data) => {
    const { addrList } = data;
    const userList = addrList.map((el) => el.addr);
    // use original list passed by props to identify addresses to add and remove
    const originalList = communityUsers.map((el) => el.addr);

    const timestamp = Date.now().toString();
    const hexTime = Buffer.from(timestamp).toString('hex');
    const _compositeSignatures = await injectedProvider
      .currentUser()
      .signUserMessage(hexTime);
    const compositeSignatures = getCompositeSigs(_compositeSignatures);
    // No valid user signature found.
    if (!compositeSignatures) {
      notifyError(
        {
          message: JSON.stringify({
            status: '401',
            statusText: `No valid user signature found.`,
          }),
        },
        ''
      );
      return;
    }

    const body = {
      signingAddr: addr,
      timestamp,
      compositeSignatures,
    };

    const toRemove = originalList.filter(
      (addToRemove) => !userList.includes(addToRemove)
    );
    const toAdd = userList.filter((toAdd) => !originalList.includes(toAdd));

    // adding and removing users are separated endpoints
    try {
      if (toRemove.length > 0) {
        await removeCommunityUsers({
          addrs: toRemove,
          type: addrType.toLocaleLowerCase(),
          body,
        });
      }
      if (toAdd.length > 0) {
        await addCommunityUsers({
          addrs: toAdd,
          type: addrType.toLocaleLowerCase(),
          body,
        });
      }
    } catch (err) {
      notifyError(
        {
          message: JSON.stringify({
            status: '401',
            statusText: `Something went wrong adding/removing ${addrType} list`,
          }),
        },
        ''
      );
      return;
    }
    // if all updates when well: reset values on form with updated values
    reset({ addrList: addrList }, { keepDirty: false });
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
