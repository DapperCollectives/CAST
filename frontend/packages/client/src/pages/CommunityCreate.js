import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { StepByStep, WalletConnect, Error } from "components";
import { useWebContext } from "contexts/Web3";
import { useModalContext } from "contexts/NotificationModal";

import {
  StartSteps,
  StepOne,
  StepTwo,
  StepThree,
} from "components/CommunityCreate";
import useCommunity from "hooks/useCommunity";

export default function CommunityCreate() {
  const [modalError, setModalError] = useState(false);
  const {
    user: { addr: creatorAddr },
    injectedProvider,
  } = useWebContext();

  const { createCommunity, data } = useCommunity();

  const history = useHistory();

  const modalContext = useModalContext();

  useEffect(() => {
    if (data?.id) {
      history.push(`/community/${data.id}`);
    }
  }, [data, history]);

  // closes modal when user is connected with wallet
  useEffect(() => {
    if (modalContext.isOpen && creatorAddr && modalError) {
      setModalError(false);
      modalContext.closeModal();
    }
  }, [modalContext, creatorAddr, modalError]);

  const onSubmit = async (stepsData) => {
    console.log(stepsData);
    // opens modal and makes user to connect with wallet
    if (!creatorAddr) {
      modalContext.openModal(
        React.createElement(Error, {
          error: (
            <div className="mt-5">
              <WalletConnect />
            </div>
          ),

          errorTitle: "Please connect a wallet to create a community.",
        }),
        { classNameModalContent: "rounded-sm" }
      );
      setModalError(true);
      return;
    }

    const fields = Object.assign({}, ...Object.values(stepsData));

    const proposalData = {
      creatorAddr,
      ...fields,
    };

    await createCommunity(injectedProvider, proposalData);
  };

  const props = {
    finalLabel: "Publish",
    onSubmit,
    isSubmitting: false,
    styleConfig: {
      currentStep: {
        icon: {
          textColor: "has-text-white",
          backgroundColor: "has-background-black",
        },
      },
      completeStep: {
        icon: {
          hexBackgroundColor: "#44C42F",
        },
      },
    },
    submittingMessage: "Creating community...",
    passNextToComp: true,
    passSubmitToComp: true,
    preStep: <StartSteps />,
    steps: [
      {
        label: "Community Profile",
        description:
          "Some description of what you can write here that is useful.",
        component: <StepOne />,
      },
      {
        label: "Community Details",
        description:
          "Some description of what you can write here that is useful.",
        component: <StepTwo stepData={{ test: "ok" }} />,
      },
      {
        label: "Proposal & Voting",
        description:
          "Some description of what you can write here that is useful.",
        component: <StepThree stepData={{ test: "ok" }} />,
      },
    ],
  };

  return <StepByStep {...props} />;
}
