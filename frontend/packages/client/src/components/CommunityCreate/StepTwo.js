import React, { useEffect } from "react";
import { CommunityUsersForm } from "../Community/CommunityEditorDetails";
import useFlowAddrValidator from "../Community/hooks/useFlowAddrValidator";
import { useMediaQuery } from "hooks";
import classnames from "classnames";

const isInitialList = (listAddr) => {
  return listAddr?.length === 1 && listAddr[0].addr === "";
};

const buttonStyle = {
  border: "none",
  fontSize: "12px",
  marginLeft: "4px",
};

export default function StepTwo({
  stepData,
  setStepValid,
  onDataChange,
  moveToNextStep,
  isStepValid,
}) {
  const notMobile = useMediaQuery();

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

  const className = classnames(
    "popover",
    { "is-popover-bottom": notMobile },
    { "is-popover-right": !notMobile }
  );
  const popoverClassName = classnames(
    "columns",
    { "m-4": notMobile },
    { "m-2": !notMobile }
  );
  return (
    <>
      <CommunityUsersForm
        title={
          <>
            Admins
            <div className={className}>
              <button
                className="delete has-text-grey rounded-full cursor-pointer popover-trigger"
                style={buttonStyle}
              >
                ?
              </button>
              <div className="popover-content">
                <div className={popoverClassName}>
                  <div className="column is-12 p-0">
                    <p
                      className="small-text has-text-weight-normal has-text-grey small-text has-text-justified mb-1"
                      style={{ lineHeight: "20px" }}
                    >
                      Admin addresses will be added automatically as authors and
                      members for the community.
                    </p>
                    <p
                      className="small-text has-text-weight-normal has-text-grey small-text has-text-justified"
                      style={{ lineHeight: "20px" }}
                    >
                      In addition, community creator address will be set as
                      admin and member by default.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        }
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
