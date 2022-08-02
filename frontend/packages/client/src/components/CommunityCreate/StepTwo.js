import React, { useEffect } from 'react';
import Popover from 'components/Popover';
import useFlowAddrValidator from '../Community/hooks/useFlowAddrValidator';
import { CommunityUsersForm } from '../Community/CommunityEditorDetails';

const isInitialList = (listAddr) => {
  return listAddr?.length === 1 && listAddr[0].addr === '';
};

const popoverParagraph =
  'In addition, community creator address will be set as admin and member by default.';
export default function StepTwo({
  stepData,
  setStepValid,
  onDataChange,
  moveToNextStep,
  isStepValid,
}) {
  const { listAddrAdmins = [{ addr: '' }], listAddrAuthors = [{ addr: '' }] } =
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
    onDataChange({ listAddrAdmins: [...listAddrAdmins, { addr: '' }] });
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
    onDataChange({ listAddrAuthors: [...listAddrAuthors, { addr: '' }] });
  };

  return (
    <>
      <CommunityUsersForm
        title={
          <>
            Admins
            <Popover
              paragraphs={[
                'Admin addresses will be added automatically as authors and members for the community.',
                popoverParagraph,
              ]}
            >
              ?
            </Popover>
          </>
        }
        description="Admins can edit community settings and moderate proposals. 
          We recommend at least two admin for each community, but it is not a requirement. 
          Please add one address per line."
        addrList={listAddrAdmins}
        onAddressChange={onAdminAddressChange}
        onDeleteAddress={onAdminAddressDelete}
        onAddAddress={onAdminAddressAdd}
        addrType="Admins"
        label="Flow wallet address"
        validateEachAddress
        onClearField={(index) => onAdminAddressChange(index, '')}
        autoFocusOnLoad={true}
      />
      <CommunityUsersForm
        title={
          <>
            Authors
            <Popover
              paragraphs={[
                'Author addresses will be added automatically as members for the community.',
                popoverParagraph,
              ]}
            >
              ?
            </Popover>
          </>
        }
        description="Authors can create and publish proposals, selecting from voting strategies set by an Admin.
          Admins are automatically added as Authors."
        addrList={listAddrAuthors}
        onAddressChange={onAuthorAddressChange}
        onDeleteAddress={onAuthorAddressDelete}
        onAddAddress={onAuthorAddressAdd}
        addrType="Authors"
        label="Flow wallet address"
        validateEachAddress
        onClearField={(index) => onAuthorAddressChange(index, '')}
        autoFocusOnLoad={false}
      />
      <div className="columns mb-5">
        <div className="column is-12">
          <button
            style={{ height: 48, width: '100%' }}
            className={`button vote-button is-flex has-background-yellow rounded-sm is-size-6 is-uppercase is-${
              isStepValid ? 'enabled' : 'disabled'
            }`}
            onClick={isStepValid ? () => moveToNextStep() : () => {}}
          >
            Next: PROPOSAL & VOTING
          </button>
        </div>
      </div>
    </>
  );
}
