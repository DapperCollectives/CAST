import React, { useEffect, useState } from "react";
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

export default function CommunityCreate() {
  const {
    user: { addr: creatorAddr },
    injectedProvider,
  } = useWebContext();

  const history = useHistory();

  const modalContext = useModalContext();

  const onSubmit = async (stepsData) => {
    console.log("on sumibt called", stepsData);
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
