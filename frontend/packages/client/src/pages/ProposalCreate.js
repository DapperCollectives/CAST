/* global plausible */
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { useModalContext } from 'contexts/NotificationModal';
import { useWebContext } from 'contexts/Web3';
import { Error, StepByStep, WalletConnect } from 'components';
import {
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
          errorTitle="Please connect a wallet to create a proposal."
        />,
        { classNameModalContent: 'rounded-sm' }
      );
      setModalError(true);
      return;
    }

    if (!communityId) {
      notifyError({
        status: 'No community information provided',
        statusText:
          'Please restart the proposal creation from the community page',
      });
      return;
    }

    const { strategy, minBalance, maxWeight, name, body } = stepsData[0];

    const hasValidStartTime = isStartTimeValid(
      stepsData[1].startTime,
      stepsData[1].startDate
    );

    if (!hasValidStartTime) {
      notifyError({
        status: 'Invalid start time for proposal',
        statusText: 'Please update start time on Set Date & Time step',
      });
      return;
    }

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

    const proposalData = {
      name,
      body,
      choices,
      creatorAddr,
      endTime,
      startTime,
      strategy: strategy,
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
    finalLabel: 'Publish',
    onSubmit,
    isSubmitting: (loading || data) && !error,
    submittingMessage: 'Creating Proposal...',
    blockNavigationOut: true && !data,
    blockNavigationText:
      'Proposal creation is not complete yet, are you sure you want to leave?',
    passNextToComp: true,
    passSubmitToComp: true,
    showActionButtonLeftPannel: true,
    steps: [
      {
        label: 'Draft Proposal',
        description:
          'Some description of what you can write here that is useful.',
        component: <PropCreateStepOne />,
        useHookForms: true,
      },
      {
        label: 'Set Date & Time',
        description:
          'Some description of what you can write here that is useful.',
        component: <PropCreateStepTwo />,
        useHookForms: true,
      },
      {
        label: 'Preview Proposal',
        description:
          'Some description of what you can write here that is useful.',
        component: <PropCreateStepThree />,
      },
    ],
  };

  return <StepByStep {...props} />;
}
