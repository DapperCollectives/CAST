import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { StepByStep, WalletConnect, Error } from 'components';
import { mapFieldsForBackend } from 'components/Community/CommunityPropsAndVoting';
import { useWebContext } from 'contexts/Web3';
import { useModalContext } from 'contexts/NotificationModal';
import {
  StartSteps,
  StepOne,
  StepTwo,
  StepThree,
  StepFour,
} from 'components/CommunityCreate';
import useCommunity from 'hooks/useCommunity';
import { generateSlug } from 'utils';

export default function CommunityCreate() {
  const [modalError, setModalError] = useState(false);
  const {
    user: { addr: creatorAddr },
    injectedProvider,
  } = useWebContext();

  const {
    createCommunity,
    data,
    loading: creatingCommunity,
    error,
  } = useCommunity();

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
    // opens modal and makes user to connect with wallet
    if (!creatorAddr) {
      modalContext.openModal(
        React.createElement(Error, {
          error: (
            <div className="mt-5">
              <WalletConnect />
            </div>
          ),

          errorTitle: 'Please connect a wallet to create a community.',
        }),
        { classNameModalContent: 'rounded-sm' }
      );
      setModalError(true);
      return;
    }
    // create one object from steps data
    const fields = Object.assign({}, ...Object.values(stepsData));

    const proposalData = {
      creatorAddr,
      ...fields,
      ...{
        strategies: fields.strategies.map((st) => ({
          name: st.name,
          contract: mapFieldsForBackend(st.contract),
        })),
      },
      slug: generateSlug(),
    };

    await createCommunity(injectedProvider, proposalData);
  };

  const props = {
    finalLabel: 'Publish',
    onSubmit,
    isSubmitting: creatingCommunity && !error,
    styleConfig: {
      currentStep: {
        icon: {
          textColor: 'has-text-white',
          backgroundColor: 'has-background-black',
        },
      },
    },
    submittingMessage: 'Creating community...',
    passNextToComp: true,
    passSubmitToComp: true,
    preStep: <StartSteps />,
    steps: [
      {
        label: 'Community Profile',
        component: <StepOne />,
      },
      {
        label: 'Community Details',
        component: <StepTwo />,
      },
      {
        label: 'Proposal & Voting',
        description: '',
        component: <StepThree />,
      },
      {
        label: 'Voting Strategies',
        component: <StepFour />,
      },
    ],
  };

  return <StepByStep {...props} />;
}
