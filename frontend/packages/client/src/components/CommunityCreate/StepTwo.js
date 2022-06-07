import React, { useEffect } from "react";
import { CommunityUsersForm } from "../Community/CommunityEditorDetails";
import useFlowAddrValidator from "../Community/hooks/useFlowAddrValidator";
import { useModalContext } from "contexts/NotificationModal";

const isInitialList = (listAddr) => {
  return listAddr?.length === 1 && listAddr[0].addr === "";
};

const HelpModal = () => {
  return (
    <div className="columns m-0 p-0 is-multiline is-mobile">
      <div className="column is-full m-0 p-0 is-flex is-justify-content-center py-5">
        <div
          className="rounded-full is-size-2 has-text-white is-flex is-align-items-center is-justify-content-center"
          style={{ height: 50, width: 50, background: "red" }}
        >
          X
        </div>
      </div>
      <div className="column is-full p-0 m-0 divider pb-5 is-flex is-flex-direction-column is-align-items-center">
        <p>{props.errorTitle}</p>
        {props?.error && props.error}
      </div>
    </div>
  );
};
export default function StepTwo({
  stepData,
  setStepValid,
  onDataChange,
  moveToNextStep,
  isStepValid,
}) {
  const { openModal, closeModal } = useModalContext();

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

  const openModalHelp = () => {
    openModal(
      React.createElement(Error, {
        error: (
          <p className="has-text-red">
            <b>{response.error}</b>
          </p>
        ),
        errorTitle: "Something went wrong with your vote.",
      }),
      {
        classNameModalContent: "rounded-sm",
      }
    );
  };

  return (
    <>
      <CommunityUsersForm
        title={
          <>
            Admins
            <button
              className="delete has-text-grey rounded-lg"
              style={{ border: "none" }}
            >
              ?
            </button>
          </>
        }
        description={
          <>
            <p>
              The admins will be able to edit the space settings and moderate
              proposals. You must add one address per line. You must add one
              address per line.
            </p>
            <p>
              Admin addresses will be added automatically as authors and members
              for the community. Community creator is set as default as admin
              and member"
            </p>
            <p>Community creator is set as admin and member by default"</p>
          </>
        }
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
