import React, { useEffect, useRef, useState } from 'react';
import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { useWebContext } from 'contexts/Web3';
import { AddButton, FadeIn, Loader, WrapperResponsive } from 'components';
import { Bin, InvalidCheckMark, ValidCheckMark } from 'components/Svg';
import useFlowAddrValidator, {
  validateAddrInList,
} from './hooks/useFlowAddrValidator';
import { useCommunityUsers } from 'hooks';
import { getCompositeSigs } from 'utils';

export const CommunityUsersForm = ({
  title,
  description,
  loadingUsers = false,
  addrList,
  onAddressChange,
  onDeleteAddress,
  onAddAddress,
  addrType = 'Admins',
  label,
  submitComponent,
  validateEachAddress = false,
  onClearField = () => {},
  autoFocusOnLoad = false,
} = {}) => {
  const canDeleteAddress = addrList.length > 1;

  const refOnFirstInput = useRef();

  useEffect(() => {
    if (refOnFirstInput.current) {
      refOnFirstInput.current.focus();
    }
  }, [refOnFirstInput]);
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
      {!loadingUsers && (
        <div className="columns is-multiline p-0 m-0">
          {addrList.map(({ addr, fromServer }, index) => {
            const validateAddr =
              validateEachAddress &&
              addr?.length > 0 &&
              validateAddrInList(addrList, addr);

            const isValid = validateAddr && validateAddr.isValid;
            const isInvalid = validateAddr && !validateAddr.isValid;

            const inputStyle = validateAddr
              ? `form-error-input-icon ${
                  isInvalid ? 'form-error-input-border' : ''
                }`
              : 'pr-6';
            return (
              <div
                key={`index-${index}`}
                className="column is-12 is-mobile p-0 m-0 mb-4 fade-in"
                style={{ position: 'relative' }}
              >
                <input
                  type="text"
                  placeholder={label || `Enter ${title}`}
                  className={`border-light rounded-sm p-3 column is-full ${inputStyle}`}
                  value={addr || ''}
                  onChange={(event) =>
                    onAddressChange(index, event.target.value)
                  }
                  autoFocus={addrList.length === index + 1 && addr === ''}
                  disabled={fromServer ?? false}
                  style={{
                    width: '100%',
                    ...(isInvalid ? {} : undefined),
                  }}
                  ref={
                    addrList.length === 1 && addr === '' && autoFocusOnLoad
                      ? refOnFirstInput
                      : undefined
                  }
                />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignContent: 'center',
                    position: 'absolute',
                    right: 15,
                    top: 9,
                  }}
                >
                  {isValid && (
                    <div className="is-flex is-align-items-center mr-2">
                      <ValidCheckMark />
                    </div>
                  )}
                  {isInvalid && (
                    <div
                      className="cursor-pointer is-flex is-align-items-center mr-2"
                      onClick={() => onClearField(index)}
                    >
                      <InvalidCheckMark />
                    </div>
                  )}
                  {canDeleteAddress && (
                    <div
                      className="cursor-pointer is-flex is-align-items-center"
                      onClick={() => onDeleteAddress(index)}
                    >
                      <Bin />
                    </div>
                  )}
                </div>
                {isInvalid && (
                  <FadeIn>
                    <div className="pl-1 mt-2">
                      <p className="smaller-text has-text-red">
                        {validateAddr.error}
                      </p>
                    </div>
                  </FadeIn>
                )}
              </div>
            );
          })}
        </div>
      )}
      <AddButton
        disabled={loadingUsers}
        addText={addrType}
        onAdd={onAddAddress}
        className="mt-2"
      />
      {submitComponent}
    </div>
  );
};

const CommunityMembersEditor = ({
  title = 'Admins',
  description = '',
  addrType = 'Admin',
  communityId,
} = {}) => {
  const {
    user: { addr },
    user,
    injectedProvider,
    signMessageByWalletProvider,
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

  const [userAddrList, setUserAddrList] = useState([]);
  const [enableSave, setEnableSave] = useState(false);
  const [addrList, setAddrList] = useState([]);
  const [savingData, setSavingData] = useState(false);

  useEffect(() => {
    if (communityUsers) {
      setUserAddrList(
        communityUsers.map((user) => ({ addr: user.addr, fromServer: true }))
      );
    }
  }, [communityUsers]);

  useEffect(() => {
    setAddrList(userAddrList);
  }, [userAddrList]);

  const saveData = async () => {
    setSavingData(true);
    const timestamp = Date.now().toString();
    const hexTime = Buffer.from(timestamp).toString('hex');

    const [compositeSignatures, voucher] = await signMessageByWalletProvider(
      user?.services[0]?.uid,
      hexTime
    );

    // No valid user signature found.
    if (!compositeSignatures && !voucher) {
      notifyError(
        {
          message: JSON.stringify({
            status: '401',
            statusText: `No valid user signature found.`,
          }),
        },
        ''
      );
      setSavingData(false);
      return;
    }

    const body = {
      signingAddr: addr,
      timestamp: hexTime,
      compositeSignatures,
      voucher,
    };

    const toRemove = userAddrList
      .filter(
        (addToRemove) => !addrList.map((e) => e.addr).includes(addToRemove.addr)
      )
      .map((e) => e.addr);
    const toAdd = addrList
      .filter((toAdd) => !userAddrList.map((e) => e.addr).includes(toAdd.addr))
      .map((e) => e.addr);

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
      // un-do changes if there was an error on front
      setAddrList(userAddrList);
      setSavingData(false);
      return;
    }
    setUserAddrList([
      ...userAddrList.filter((e) => !toRemove.includes(e.addr)),
      ...toAdd.map((e) => ({ addr: e, fromServer: true })),
    ]);
    setSavingData(false);
  };

  const onAddAddr = () => {
    setAddrList((list) => [...list, { addr: '' }]);
  };

  const setAddress = (index, value) => {
    const newList = addrList.map((admin, idx) =>
      idx === index ? { addr: value.trim() } : admin
    );
    setAddrList(newList);
  };

  const onDeleteAddress = (index) => {
    if (addrList.length <= 1) {
      return;
    }
    const newList = addrList.filter((_, idx) => idx !== index);
    setAddrList(newList);
  };

  const { isValid, hasChangedFromOriginal } = useFlowAddrValidator({
    addrList,
    initialList: userAddrList,
  });

  useEffect(() => {
    setEnableSave(isValid && hasChangedFromOriginal);
  }, [isValid, hasChangedFromOriginal]);

  return (
    <CommunityUsersForm
      submitComponent={
        <button
          style={{ height: 48, width: '100%' }}
          className={`button transition-all is-flex has-background-yellow rounded-sm mt-5 is-uppercase is-uppercase is-${
            enableSave ? 'enabled' : 'disabled'
          }`}
          onClick={!enableSave ? () => {} : saveData}
        >
          {!savingData && <>Save</>}
          {savingData && <Loader size={18} spacing="mx-button-loader" />}
        </button>
      }
      title={title}
      description={description}
      loadingUsers={loadingUsers}
      addrList={addrList}
      onAddressChange={setAddress}
      onDeleteAddress={onDeleteAddress}
      onAddAddress={onAddAddr}
      addrType={addrType}
    />
  );
};

export default function CommunityEditorDetails({ communityId } = {}) {
  return (
    <>
      <CommunityMembersEditor
        description="Admins can edit community settings and moderate proposals.
          We recommend at least two admin for each community, but it is not a requirement.
          Please add one address per line."
        type="admin"
        communityId={communityId}
      />
      <CommunityMembersEditor
        title="Authors"
        addrType="Author"
        description="Authors can create and publish proposals, selecting from voting strategies set by an Admin.
          Admins are automatically added as Authors."
        communityId={communityId}
      />
    </>
  );
}
