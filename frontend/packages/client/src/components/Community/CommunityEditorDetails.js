import React, { useState, useEffect } from "react";
import { Plus, Bin } from "components/Svg";
import { WrapperResponsive, Loader } from "components";
import { useCommunityUsers } from "hooks";
import { useErrorHandlerContext } from "contexts/ErrorHandler";
import { useWebContext } from "contexts/Web3";
import { getCompositeSigs } from "utils";

const uniqueElements = (adminList) => {
  const setList = new Set([
    ...adminList.map((e) => e.addr.toLocaleLowerCase()),
  ]);
  return adminList.length === setList.size;
};

const hasValidAddresses = (list) => {
  return list.every((el) => /0[x,X][a-zA-Z0-9]{16}$/gim.test(el.addr));
};
const listHasChanged = (adminList, admins) => {
  const setList = new Set([...adminList.map((e) => e.addr)]);

  if (admins.length !== setList.size) return true;

  for (let admin of admins) if (!setList.has(admin)) return true;

  return false;
};

const notEmptyAddr = (list) => {
  return list.every((e) => e.addr.trim().length > 0);
};

const CommunityMembersEditor = ({
  title = "Admins",
  description = "",
  addrType = "Admin",
  communityId,
} = {}) => {
  const {
    user: { addr },
    injectedProvider,
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
    const hexTime = Buffer.from(timestamp).toString("hex");
    const _compositeSignatures = await injectedProvider
      .currentUser()
      .signUserMessage(hexTime);

    const compositeSignatures = getCompositeSigs(_compositeSignatures);

    // No valid user signature found.
    if (!compositeSignatures) {
      notifyError(
        {
          message: JSON.stringify({
            status: "401",
            statusText: `No valid user signature found.`,
          }),
        },
        ""
      );
      setSavingData(false);
      return;
    }

    const body = {
      signingAddr: addr,
      timestamp,
      compositeSignatures,
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
            status: "401",
            statusText: `Something went wrong adding/removing ${addrType} list`,
          }),
        },
        ""
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
    setAddrList((list) => [...list, { addr: "" }]);
  };

  const setAddress = (index) => (event) => {
    const newList = addrList.map((admin, idx) =>
      idx === index ? { addr: event.target.value.trim() } : admin
    );
    setAddrList(newList);
  };

  const onDeleteAddress = (index) => () => {
    if (addrList.length <= 1) {
      return;
    }
    const newList = addrList.filter((_, idx) => idx !== index);
    setAddrList(newList);
  };

  useEffect(() => {
    if (
      addrList.length === 0 ||
      !notEmptyAddr(addrList) ||
      !uniqueElements(addrList) ||
      !hasValidAddresses(addrList) ||
      !listHasChanged(
        addrList,
        userAddrList.map((e) => e.addr)
      )
    ) {
      setEnableSave(false);
    }
    if (
      addrList.length > 0 &&
      listHasChanged(
        addrList,
        userAddrList.map((e) => e.addr)
      ) &&
      uniqueElements(addrList) &&
      notEmptyAddr(addrList) &&
      hasValidAddresses(addrList)
    ) {
      setEnableSave(true);
    }
  }, [addrList, setEnableSave, userAddrList]);

  const canDeleteAddress = addrList.length > 1;

  return (
    <WrapperResponsive
      classNames="border-light rounded-lg columns is-flex-direction-column is-mobile m-0"
      extraClasses="p-6 mb-6"
      extraClassesMobile="p-4 mb-4"
    >
      <div className="columns flex-1">
        <div className="column">
          <div className="is-flex flex-1">
            <WrapperResponsive
              tag="h5"
              classNames="title is-6 mb-2"
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
          {addrList.map(({ addr, fromServer }, index) => (
            <div
              key={`index-${index}`}
              className="column is-12 is-mobile p-0 m-0 fade-in"
              style={{ position: "relative" }}
            >
              <input
                type="text"
                placeholder={`Enter ${title}`}
                className="border-light rounded-sm p-3 mb-4 column is-full pr-6"
                value={addr || ""}
                onChange={setAddress(index)}
                autoFocus={addrList.length === index + 1 && addr === ""}
                disabled={fromServer ?? false}
                style={{ width: "100%" }}
              />
              {canDeleteAddress && (
                <div
                  className="cursor-pointer"
                  style={{
                    position: "absolute",
                    right: 15,
                    top: 7,
                  }}
                  onClick={onDeleteAddress(index)}
                >
                  <Bin />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <div
        className={`mt-2 is-flex is-align-items-centered ${
          loadingUsers ? "is-disabled has-text-grey" : "cursor-pointer"
        }`}
        onClick={onAddAddr}
        style={loadingUsers ? { opacity: 0.5 } : {}}
      >
        <Plus />{" "}
        <span className="ml-2 small-text is-flex is-align-items-center">
          Add{` ${addrType}`}
        </span>
      </div>
      <button
        style={{ height: 48, width: "100%" }}
        className={`button transition-all is-flex has-background-yellow rounded-sm mt-5 is-uppercase is-${
          enableSave ? "enabled" : "disabled"
        }`}
        onClick={!enableSave ? () => {} : saveData}
      >
        {!savingData && <>Save</>}
        {savingData && <Loader size={18} spacing="mx-button-loader" />}
      </button>
    </WrapperResponsive>
  );
};

export default function CommunityEditorDetails({ communityId } = {}) {
  return (
    <>
      <CommunityMembersEditor
        description="The admins will be able to edit the space settings and moderate
              proposals. You must add one address per line."
        type="admin"
        communityId={communityId}
      />
      <CommunityMembersEditor
        title="Authors"
        addrType="Author"
        description="Authors can post proposals regardless of their voting power."
        communityId={communityId}
      />
    </>
  );
}
