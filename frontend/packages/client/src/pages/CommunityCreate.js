import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { StepByStep, WalletConnect, Error } from 'components';
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
    isValidFlowAddress,
  } = useWebContext();

  const {
    createCommunity,
    data,
    loading: creatingCommunity,
    error,
  } = useCommunity({ initialLoading: false });

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

    const {
      contractAddress,
      listAddrAdmins = [],
      listAddrAuthors = [],
      strategies = [],
    } = fields;

    // validate Flow Addresses used
    const addressesToValidate = {
      'Contract Address': [contractAddress],
      'Admin List': listAddrAdmins.map((e) => e.addr),
      'Author List': listAddrAuthors.map((e) => e.addr),
      Strategies: strategies,
    };

    const validation = Object.entries(addressesToValidate);
    const errorMessages = [];
    await Promise.all(
      validation.map(async (ele) => {
        try {
          await Promise.all(
            ele[1].map(async (addr) => {
              await isValidFlowAddress(addr);
            })
          );
        } catch (error) {
          errorMessages.push(ele[0]);
        }
      })
    );
    // open modal if there are errors on addresses
    if (!errorMessages.lenght) {
      modalContext.openModal(
        React.createElement(Error, {
          error: (
            <div className="mt-4">
              <p className="is-size-6">
                Addresses used are not valid Flow addresses:
              </p>
              <div className="is-flex is-align-items-center is-justify-content-center">
                <ul>
                  {errorMessages.map((type, index) => (
                    <li key={`error-${index}`}>
                      <p className="smaller-text mt-2 has-text-red">- {type}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ),
          errorTitle: 'Flow Address Error',
        }),
        { classNameModalContent: 'rounded-sm' }
      );
      return;
    }

    const communityData = {
      creatorAddr,
      ...fields,
      slug: generateSlug(),
    };

    await createCommunity(injectedProvider, communityData);
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
