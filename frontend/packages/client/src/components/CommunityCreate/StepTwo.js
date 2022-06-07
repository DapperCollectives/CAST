import React, { useEffect } from "react";
import { CommunityUsersForm } from "../Community/CommunityEditorDetails";
import useFlowAddrValidator from "../Community/hooks/useFlowAddrValidator";

const isInitialList = (listAddr) => {
  return listAddr?.length === 1 && listAddr[0].addr === "";
};
export default function StepTwo({
  stepData,
  setStepValid,
  onDataChange,
  moveToNextStep,
  isStepValid,
}) {
  const { listAddrAdmins = [{ addr: "" }], listAddrAuthors = [{ addr: "" }] } =
    stepData || {};

  const { isValid: isValidAdmins } = useFlowAddrValidator({
    addrList: listAddrAdmins,
  });
  const { isValid: isValidAuthors } = useFlowAddrValidator({
    addrList: listAddrAuthors,
  });

  useEffect(() => {
    if (
      (isInitialList(listAddrAdmins) && isInitialList(listAddrAuthors)) ||
      (isInitialList(listAddrAdmins) && isValidAuthors) ||
      (isInitialList(listAddrAuthors) && isValidAdmins)
    ) {
      setStepValid(true);
      return;
    }
    setStepValid(isValidAuthors && isValidAdmins);
  }, [
    isValidAuthors,
    isValidAdmins,
    setStepValid,
    listAddrAdmins,
    listAddrAuthors,
  ]);

  const onAdminAddressChange = (index, value) => {
    const addrListUpdated = listAddrAdmins.map((addr, idx) => {
      return idx === index ? { addr: value.trim() } : addr;
    });

    onDataChange({ listAddrAdmins: addrListUpdated });
  };

  const onAdminAddressDelete = (index) => {
    const newAddrs = listAddrAdmins.slice(0);
    newAddrs.splice(index, 1);
    onDataChange({ listAddrAdmins: newAddrs });
  };

  const onAdminAddressAdd = () => {
    onDataChange({ listAddrAdmins: [...listAddrAdmins, { addr: "" }] });
  };

  const onAuthorAddressChange = (index, value) => {
    const addrListUpdated = listAddrAuthors.map((addr, idx) => {
      return idx === index ? { addr: value.trim() } : addr;
    });

    onDataChange({ listAddrAuthors: addrListUpdated });
  };

  const onAuthorAddressDelete = (index) => {
    const newAddrs = listAddrAuthors.slice(0);
    newAddrs.splice(index, 1);
    onDataChange({ listAddrAuthors: newAddrs });
  };

  const onAuthorAddressAdd = () => {
    onDataChange({ listAddrAuthors: [...listAddrAuthors, { addr: "" }] });
  };

  return (
    <>
      <CommunityUsersForm
        title="Admins"
        description="The admins will be able to edit the space settings and moderate proposals. You must add one address per line."
        addrList={listAddrAdmins}
        onAddressChange={onAdminAddressChange}
        onDeleteAddress={onAdminAddressDelete}
        onAddAddress={onAdminAddressAdd}
        addrType="Admins"
        label="Domain name or wallet address"
        validateEachAddress
        onClearField={(index) => onAdminAddressChange(index, "")}
      />
      <CommunityUsersForm
        title="Authors"
        description="Authors can post proposals regardless of their voting power."
        addrList={listAddrAuthors}
        onAddressChange={onAuthorAddressChange}
        onDeleteAddress={onAuthorAddressDelete}
        onAddAddress={onAuthorAddressAdd}
        addrType="Authors"
        label="Domain name or wallet address"
        validateEachAddress
        onClearField={(index) => onAuthorAddressChange(index, "")}
      />
      <div className="columns mb-5">
        <div className="column is-12">
          <button
            style={{ height: 48, width: "100%" }}
            className={`button vote-button transition-all is-flex has-background-yellow rounded-sm is-size-6 is-uppercase is-${
              isStepValid ? "enabled" : "disabled"
            }`}
            onClick={isStepValid ? () => moveToNextStep() : () => {}}
          >
            Next: PROPOSALS & VOTING
          </button>
        </div>
      </div>
    </>
  );
}
