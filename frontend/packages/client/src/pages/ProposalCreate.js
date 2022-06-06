/* global plausible */
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { StepByStep, WalletConnect, Error } from "../components";
import { useWebContext } from "../contexts/Web3";
import { useModalContext } from "../contexts/NotificationModal";
import { useProposal } from "../hooks";
import { parseDateToServer, customDraftToHTML } from "utils";
import {
  PropCreateStepOne,
  PropCreateStepTwo,
  PropCreateStepThree,
} from "../components/ProposalCreate";

export default function ProposalCreatePage() {
  const { createProposal, data, loading, error } = useProposal();
  const [modalError, setModalError] = useState(null);
  const {
    user: { addr: creatorAddr },
    injectedProvider,
  } = useWebContext();
  const history = useHistory();

  const modalContext = useModalContext();

  useEffect(() => {
    if (data?.id) {
      history.push(`/proposal/${data.id}`);
    }
  }, [data, history]);

  useEffect(() => {
    if (modalContext.isOpen && creatorAddr && modalError) {
      setModalError(false);
      modalContext.closeModal();
    }
  }, [modalContext, creatorAddr, modalError]);

  const onSubmit = async (stepsData) => {
    if (!creatorAddr) {
      modalContext.openModal(
        React.createElement(Error, {
          error: (
            <div className="mt-5">
              <WalletConnect />
            </div>
          ),

          errorTitle: "Please connect a wallet to create a proposal.",
        }),
        { classNameModalContent: "rounded-sm" }
      );
      setModalError(true);
      return;
    }

    const name = stepsData[0].title;

    const currentContent = stepsData[0]?.description?.getCurrentContent();

    const body = customDraftToHTML(currentContent);

    const startTime = parseDateToServer(
      stepsData[1].startDate,
      stepsData[1].startTime
    ).toISOString();

    const endTime = parseDateToServer(
      stepsData[1].endDate,
      stepsData[1].endTime
    ).toISOString();

    const choices = stepsData[0].choices.map((c) => ({
      choiceText: c.value,
      choiceImgUrl: c?.choiceImgUrl ?? null,
    }));

    const { strategy } = stepsData[0];

    const proposalData = {
      name,
      body,
      choices,
      creatorAddr,
      endTime,
      startTime,
      strategy: strategy?.value,
      status: "published",
    };

    await createProposal(injectedProvider, proposalData);
    plausible("Proposal Created");
  };

  const props = {
    finalLabel: "Publish",
    onSubmit,
    creatingProposal: loading && !error,
    steps: [
      {
        label: "Draft Proposal",
        description:
          "Some description of what you can write here that is useful.",
        component: <PropCreateStepOne />,
      },
      {
        label: "Set Date & Time",
        description:
          "Some description of what you can write here that is useful.",
        component: <PropCreateStepTwo stepData={{ test: "ok" }} />,
      },
      {
        label: "Preview Proposal",
        description:
          "Some description of what you can write here that is useful.",
        component: <PropCreateStepThree stepData={{ test: "ok" }} />,
      },
    ],
  };

  return <StepByStep {...props} />;
}
