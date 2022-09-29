import { useEffect, useRef } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { useWebContext } from 'contexts/Web3';
import { ActionButton } from 'components';
import { useCommunityUsers, useCommunityUsersMutation } from 'hooks';
import { UPDATE_COMMUNITY_TX } from 'const';
import { yupResolver } from '@hookform/resolvers/yup';
import isEqual from 'lodash/isEqual';
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
    user,
    isValidFlowAddress,
    signMessageByWalletProvider,
  } = useWebContext();

  const { notifyError } = useErrorHandlerContext();

  const communityUsersPrev = useRef([]);

  const { data: communityUsers, isLoading: loadingUsers } = useCommunityUsers({
    communityId,
    type: addrType.toLocaleLowerCase(),
    // if list goes up from 100 we need to add a fetch more button
    count: 100,
  });

  const { removeCommunityUsers, addCommunityUsers } = useCommunityUsersMutation(
    { communityId }
  );

  const { register, control, handleSubmit, reset, formState } = useForm({
    mode: 'all',
    resolver: yupResolver(
      AddressSchema({
        fieldNames: ['addrList'],
        isValidFlowAddress,
        isEditMode: true,
      })
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

  // if endpoint returns new data then update list and keep a copy
  useEffect(() => {
    if (
      communityUsers?.length > 0 &&
      !isEqual(communityUsers, communityUsersPrev.current)
    ) {
      reset({ addrList: communityUsers.map((el) => ({ addr: el.addr })) });
      communityUsersPrev.current = communityUsers;
    }
  }, [communityUsers, reset]);

  // load from api existing addresses: runs on initial load
  useEffect(() => {
    if (communityUsers?.length > 0 && addrList.length === 0) {
      reset({ addrList: communityUsers.map((el) => ({ addr: el.addr })) });
    }
  }, [communityUsers, reset, addrList]);

  const onSubmit = async (data) => {
    const { addrList } = data;
    const userList = addrList.map((el) => el.addr);
    // use original list passed by props to identify addresses to add and remove
    const originalList = communityUsers.map((el) => el.addr);

    const timestamp = Date.now().toString();
    const [compositeSignatures, voucher] = await signMessageByWalletProvider(
      user?.services[0]?.uid,
      UPDATE_COMMUNITY_TX,
      timestamp
    );
    // No valid user signature found.
    if (!compositeSignatures && !voucher) {
      throw new Error('No valid user signature found.');
    }

    const body = {
      signingAddr: addr,
      timestamp,
      compositeSignatures,
      voucher,
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
          userType: addrType.toLocaleLowerCase(),
          body,
        });
      }
      if (toAdd.length > 0) {
        await addCommunityUsers({
          addrs: toAdd,
          userType: addrType.toLocaleLowerCase(),
          body,
        });
      }
    } catch (err) {
      notifyError({
        details: `Something went wrong adding/removing ${addrType} list`,
      });
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
          label="Save"
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
