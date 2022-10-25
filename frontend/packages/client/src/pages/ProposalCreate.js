/* global plausible */
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { useModalContext } from 'contexts/NotificationModal';
import { useWebContext } from 'contexts/Web3';
import { ErrorModal, StepByStep, WalletConnect } from 'components';
import {
  PreviewComponent,
  PropCreateStepOne,
  PropCreateStepThree,
  PropCreateStepTwo,
} from 'components/ProposalCreate';
import { useProposalCreateMutation } from 'hooks';
import { isStartTimeValid, parseDateToServer } from 'utils';

export default function ProposalCreatePage() {
  const { createProposal, data, loading, error } = useProposalCreateMutation();
  const [modalError, setModalError] = useState(null);
  const {
    user: { addr: creatorAddr },
  } = useWebContext();
  const history = useHistory();

  const modalContext = useModalContext();

  const { notifyError } = useErrorHandlerContext();

  const { communityId } = useParams();

  useEffect(() => {
    if (data?.id) {
      history.push(`/community/${data.communityId}/proposal/${data.id}`);
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
        <ErrorModal
          message="Please connect a wallet to create a proposal."
          title="Connect Wallet"
          footerComponent={
            <WalletConnect
              closeModal={() => {
                modalContext.closeModal();
              }}
              expandToContainer
            />
          }
          onClose={modalContext.closeModal}
        />,
        { isErrorModal: true }
      );
      setModalError(true);
      return;
    }

    if (!communityId) {
      notifyError({
        message: 'Missing information',
        details:
          'No community information provided. Please restart the proposal creation from the community page',
      });
      return;
    }

    const { strategy, minBalance, maxWeight, name, body, voteType } =
      stepsData[0];

    const hasValidStartTime = isStartTimeValid(
      stepsData[2].startTime,
      stepsData[2].startDate
    );

    if (!hasValidStartTime) {
      notifyError({
        message: 'Invalid start time',
        details: 'Please update start time on Set Date & Time step',
      });
      return;
    }

    const startTime = parseDateToServer(
      stepsData[2].startDate,
      stepsData[2].startTime
    ).toISOString();

    const endTime = parseDateToServer(
      stepsData[2].endDate,
      stepsData[2].endTime
    ).toISOString();

    const choices = stepsData[1].choices.map((c) => ({
      choiceText: c.value,
      choiceImgUrl: c?.choiceImgUrl ?? null,
    }));

    const proposalData = {
      name,
      body,
      choices,
      creatorAddr,
      endTime,
      startTime,
      strategy: strategy,
      voteType,
      ...(minBalance !== ''
        ? { minBalance: parseFloat(minBalance) }
        : undefined),
      ...(maxWeight !== '' ? { maxWeight: parseFloat(maxWeight) } : undefined),
      status: 'published',
      communityId,
      achievementsDone: false,
    };

    await createProposal(proposalData);
    plausible('Proposal Created');
  };

  const props = {
    finalLabel: 'Save and Publish',
    onSubmit,
    isSubmitting: (loading || data) && !error,
    submittingMessage: 'Creating Proposal...',
    blockNavigationOut: true && !data,
    blockNavigationText:
      'Proposal creation is not complete yet, are you sure you want to leave?',
    passNextToComp: true,
    passSubmitToComp: true,
    previewComponent: <PreviewComponent />,
    steps: [
      {
        label: 'Proposal',
        description:
          'Some description of what you can write here that is useful.',
        component: <PropCreateStepOne />,
        useHookForms: true,
      },
      {
        label: 'Voting Options',
        description:
          'Some description of what you can write here that is useful.',
        component: <PropCreateStepTwo />,
        useHookForms: true,
      },
      {
        label: 'Date and Time',
        description:
          'Some description of what you can write here that is useful.',
        component: <PropCreateStepThree />,
        useHookForms: true,
      },
    ],
  };

  return <StepByStep {...props} />;
}
