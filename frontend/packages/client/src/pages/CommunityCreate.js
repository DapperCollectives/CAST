import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useModalContext } from 'contexts/NotificationModal';
import { useWebContext } from 'contexts/Web3';
import { Error, StepByStep, WalletConnect } from 'components';
import {
  StartSteps,
  StepFour,
  StepOne,
  StepThree,
  StepTwo,
} from 'components/CommunityCreate';
import useCommunity from 'hooks/useCommunity';
import { generateSlug } from 'utils';

export default function CommunityCreate() {
  const [modalError, setModalError] = useState(false);
  const {
    user: { addr: creatorAddr },
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
    // if (data && data[0]?.id && isBlocking) {
    //   setIsBlocking(false);
    // }
    if (data && data[0]?.id) {
      history.push(`/community/${data[0].id}`);
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
        <Error
          error={
            <div className="mt-5">
              <WalletConnect
                closeModal={() => {
                  modalContext.closeModal();
                }}
              />
            </div>
          }
          errorTitle="Please connect a wallet to create a community."
        />,
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

    const addrAdmins = listAddrAdmins
      .map((e) => e.addr)
      .filter((addr) => !!addr);
    const addrAuthors = listAddrAuthors
      .map((e) => e.addr)
      .filter((addr) => !!addr);

    // validate Flow Addresses used
    const addressesToValidate = {
      'Contract Address': contractAddress ? [contractAddress] : [],
      'Admin List': addrAdmins,
      'Author List': addrAuthors,
      Strategies: strategies
        .filter((st) => st.name !== 'custom-script')
        .map(({ contract }) => contract.addr),
    };

    const validation = Object.entries(addressesToValidate);
    const errorMessages = [];
    await Promise.all(
      validation.map(async ([name, addrs]) => {
        try {
          await Promise.all(addrs.map((addr) => isValidFlowAddress(addr)));
        } catch (error) {
          // This is to bypass error on local
          // emulator when keys field is not present
          // on flow emulator response
          if (process.env.REACT_APP_APP_ENV?.toUpperCase() === 'PRODUCTION') {
            errorMessages.push(name);
          } else if (
            !error?.message.includes(
              "Cannot read properties of undefined (reading 'map')"
            )
          ) {
            errorMessages.push(name);
          }
        }
      })
    );
    // open modal if there are errors on addresses
    if (errorMessages.length) {
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
      listAddrAdmins: addrAdmins,
      listAddrAuthors: addrAuthors,
      slug: generateSlug(),
    };

    await createCommunity(communityData);
  };

  const props = {
    finalLabel: 'Publish',
    onSubmit,
    isSubmitting: (creatingCommunity || data) && !error,
    submittingMessage: 'Creating community...',
    passNextToComp: true,
    passSubmitToComp: true,
    preStep: <StartSteps />,
    blockNavigationOut: true && !data,
    blockNavigationText:
      'Community creation is not complete yet, are you sure you want to leave?',
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
