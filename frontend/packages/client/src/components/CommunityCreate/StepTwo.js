import React, { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useWebContext } from 'contexts/Web3';
import { ActionButton } from 'components';
import {
  AddressForm,
  AddressSchema,
} from 'components/Community/CommunityEditorDetails';
import Popover from 'components/Popover';
import { yupResolver } from '@hookform/resolvers/yup';

const popoverParagraph =
  'In addition, community creator address will be set as admin and member by default.';

export default function StepTwo({ stepData, onDataChange, moveToNextStep }) {
  const { listAddrAdmins = [], listAddrAuthors = [] } = stepData || {};

  const { isValidFlowAddress } = useWebContext();

  const { register, control, handleSubmit, reset, formState } = useForm({
    resolver: yupResolver(
      AddressSchema({
        fieldNames: ['listAddrAdmins', 'listAddrAuthors'],
        isValidFlowAddress,
      })
    ),
  });

  const { isDirty, isSubmitting, errors, isValid } = formState;
  // list for admins
  const {
    fields: addrAdminList,
    append: appendToAdmin,
    remove: removeFromAdmin,
    update: updateOnAdmin,
  } = useFieldArray({
    control,
    name: 'listAddrAdmins',
    focusAppend: true,
  });
  // list for authors
  const {
    fields: addrAuthorList,
    append: appendToAuthor,
    remove: removeFromAuthor,
    update: updateOnAuthor,
  } = useFieldArray({
    control,
    name: 'listAddrAuthors',
    focusAppend: true,
  });

  useEffect(() => {
    // first initial load
    if (
      Object.keys(stepData ?? {}).length === 0 &&
      addrAdminList.length === 0 &&
      addrAuthorList.length === 0
    ) {
      appendToAuthor({ addr: '' });
      appendToAdmin({ addr: '' });
    }
    // returns form next step back to this step
    else if (
      Object.keys(stepData ?? {}).length > 0 &&
      addrAdminList.length === 0 &&
      addrAuthorList.length === 0
    ) {
      reset(
        {
          listAddrAdmins,
          listAddrAuthors,
        },
        { keepIsValid: true }
      );
    }
  }, [
    stepData,
    listAddrAdmins,
    listAddrAuthors,
    addrAdminList,
    addrAuthorList,
    reset,
    appendToAuthor,
    appendToAdmin,
  ]);

  const onSubmit = (data) => {
    const { listAddrAdmins = [], listAddrAuthors = [] } = data;

    const admins = listAddrAdmins.map((e) => ({ addr: e.addr }));
    const authors = listAddrAuthors.map((e) => ({ addr: e.addr }));

    onDataChange({ listAddrAdmins: admins, listAddrAuthors: authors });
    moveToNextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <AddressForm
        removeInnerForm
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
        addrList={addrAdminList}
        listName="listAddrAdmins"
        onDeleteAddress={removeFromAdmin}
        onAddAddress={appendToAdmin}
        register={register}
        control={control}
        isValid={isValid}
        update={updateOnAdmin}
        addrType={'admin'}
        errors={errors}
      />
      <AddressForm
        removeInnerForm
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
        addrList={addrAuthorList}
        listName="listAddrAuthors"
        onDeleteAddress={removeFromAuthor}
        onAddAddress={appendToAuthor}
        register={register}
        control={control}
        isValid={isValid}
        update={updateOnAuthor}
        addrType={'author'}
        errors={errors}
      />
      <div className="columns mb-5">
        <div className="column is-12">
          <ActionButton
            type="submit"
            label="Next: PROPOSAL & VOTING"
            enabled={(isValid || isDirty) && !isSubmitting}
            classNames="vote-button transition-all has-background-yellow mt-5"
          />
        </div>
      </div>
    </form>
  );
}
