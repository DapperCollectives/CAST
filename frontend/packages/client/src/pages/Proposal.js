import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { useModalContext } from 'contexts/NotificationModal';
import { useWebContext } from 'contexts/Web3';
import { Svg } from '@cast/shared-components';
import {
  CastingVoteModal,
  CommunityName,
  Loader,
  Message,
  ProposalInformation,
  StrategyModal,
  StyledStatusPill,
  Tablink,
  VoteConfirmationModal,
  VoteConfirmedModal,
  VotesList,
  WalletConnect,
  WrapperResponsive,
} from 'components';
import {
  CancelProposalModalConfirmation,
  HeaderNavigation,
  VoteOptions,
} from 'components/Proposal';
import {
  useMediaQuery,
  useProposal,
  useProposalMutation,
  useUserRoleOnCommunity,
  useVoteOnProposal,
  useVotingStrategies,
} from 'hooks';
import { FilterValues } from 'const';
import { getProposalType } from 'utils';

function useQueryParams() {
  const { search } = useLocation();
  return useMemo(() => {
    const params = new URLSearchParams(search);
    return {
      forceLedger: params.get('ledger') === 'true',
    };
  }, [search]);
}

const VoteUserError = () => (
  <div className="columns m-0 p-0 is-multiline is-mobile">
    <div className="column is-full m-0 p-0 is-flex is-justify-content-center py-5">
      <div
        className="rounded-full is-size-2 has-text-white is-flex is-align-items-center is-justify-content-center"
        style={{ height: 50, width: 50, background: 'red' }}
      >
        X
      </div>
    </div>
    <div className="column is-full p-0 m-0 divider pb-5 is-flex is-justify-content-center">
      <p>Please connect a wallet to vote on a proposal.</p>
    </div>
    <div className="column is-full p-0 m-0 divider py-5 is-flex is-justify-content-center">
      <WalletConnect />
    </div>
  </div>
);

export default function ProposalPage() {
  const isNotMobile = useMediaQuery();
  const [optionChosen, setOptionChosen] = useState(null);
  const [confirmingVote, setConfirmingVote] = useState(false);
  const [castingVote, setCastingVote] = useState(false);
  const [castVote, setCastVote] = useState(null);
  const [cancelled, setCancelled] = useState(false);
  const [visibleTab, setVisibleTab] = useState({
    proposal: true,
    summary: false,
  });
  const [isCollapsed, setIsCollapsed] = useState(true);
  const descriptionRef = useRef();
  const [isStrategyModalOpen, setIsStrategyModalOpen] = useState(false);

  // setting this manually for users that do not have a ledger device
  const { forceLedger } = useQueryParams();

  const modalContext = useModalContext();

  const { notifyError } = useErrorHandlerContext();

  const { user, setWebContextConfig, openWalletModal } = useWebContext();

  // setting this manually for users that do not have a ledger device
  useEffect(() => {
    if (forceLedger) {
      setWebContextConfig({ forceLedger: true });
    }
  }, [forceLedger, setWebContextConfig]);

  const { proposalId } = useParams();

  const {
    isLoading: loading,
    data: proposal,
    error,
  } = useProposal({ proposalId });
  const { voteOnProposal } = useVoteOnProposal();
  const { updateProposal } = useProposalMutation();

  // this is for existing proposals that have the target="_self" from the db
  // bc we want all links to open in new tabs
  const htmlBody = proposal?.body?.replace(
    /target="_self"/g,
    'target="_blank" rel="noopener noreferrer"'
  );

  // this hook calculates if body should be collapsed
  useEffect(() => {
    const { current } = descriptionRef;
    if (current?.clientHeight < 300) {
      setIsCollapsed(false);
    }
  }, [descriptionRef, htmlBody]);

  // we need to get all strategies to obtain
  // description text to display on modal
  const {
    isLoading: loadingStrategies,
    data: votingStrategies,
    error: strategiesError,
  } = useVotingStrategies();

  // only authors on community can cancel the proposal
  const canCancelProposal = useUserRoleOnCommunity({
    addr: user?.addr,
    communityId: proposal?.communityId,
    roles: ['author'],
  });

  const proposalStrategy =
    votingStrategies && !loadingStrategies && proposal && !loading
      ? votingStrategies.find(
          (voteStrategy) => voteStrategy.key === proposal.strategy
        ) || {
          // fallback if no match
          description: proposal.strategy,
          key: proposal.strategy,
          name: proposal.strategy,
        }
      : {};

  const openStrategyModal = () => {
    setIsStrategyModalOpen(true);
  };

  const closeStrategyModal = () => {
    setIsStrategyModalOpen(false);
  };

  const onOptionSelect = (value) => {
    setOptionChosen(value);
  };

  const onConfirmVote = () => {
    if (user.loggedIn) {
      setConfirmingVote(true);
    } else {
      openWalletModal();
    }
  };

  const onCancelVote = () => {
    // clean option selected only if it's image based option
    if (getProposalType(proposal.choices) === 'image') {
      setOptionChosen(null);
    }
    setConfirmingVote(false);
  };

  const onCancelProposal = async () => {
    if (!proposal) {
      return;
    }

    const onDismiss = () => {
      modalContext.closeModal();
    };

    const onCancelProposal = async () => {
      try {
        await updateProposal({
          ...proposal,
          updatePayload: {
            status: 'cancelled',
            signingAddr: user?.addr,
          },
        });
      } catch (error) {
        return;
      }
      // is no errors continue
      setCancelled(true);
    };
    modalContext.openModal(
      <CancelProposalModalConfirmation
        onDismiss={onDismiss}
        onCancelProposal={onCancelProposal}
        proposalName={proposal.name}
      />,
      {
        isErrorModal: true,
      }
    );
  };

  const onVote = async () => {
    if (!user || !user.addr) {
      setConfirmingVote(false);
      modalContext.openModal(VoteUserError);
      return;
    }

    const voteData = {
      choices: [optionChosen],
      addr: user.addr,
    };

    setCastingVote(true);
    try {
      await voteOnProposal({ proposal, voteData });
    } catch (error) {
      setConfirmingVote(false);
      setCastingVote(false);
      notifyError(error);
      return;
    }
    setCastVote(optionChosen);
  };

  const onConfirmCastVote = () => {
    setCastingVote(false);
    setConfirmingVote(false);
  };

  const getVoteLabel = (val) => {
    const match = proposal.choices.find(
      (opt) => String(opt.value) === String(val)
    );
    return match?.label;
  };

  const showCancelButton = ![
    FilterValues.cancelled.toLocaleLowerCase(),
    FilterValues.closed.toLocaleLowerCase(),
  ].includes(proposal?.computedStatus);

  const setTab = (tab) => () => {
    setVisibleTab({
      proposal: tab === 'proposal',
      summary: tab === 'summary',
    });
  };
  if (error) {
    return null;
  }

  if (loading || !proposal) {
    return (
      <section className="section full-height">
        <Loader fullHeight />
      </section>
    );
  }

  return (
    <>
      {/* TODO: port this to use modal provider */}
      {confirmingVote && !castingVote && (
        <div className="modal is-active">
          <div className="modal-background"></div>
          <div className="modal-content is-flex is-justify-content-center">
            <VoteConfirmationModal
              onCancelVote={onCancelVote}
              onVote={onVote}
              voteLabel={getVoteLabel(optionChosen)}
            />
          </div>
        </div>
      )}
      {confirmingVote && castingVote && !castVote && (
        <div className="modal is-active">
          <div className="modal-background"></div>
          <div className="modal-content is-flex is-justify-content-center">
            <CastingVoteModal />
          </div>
        </div>
      )}
      {confirmingVote && castingVote && castVote && (
        <div className="modal is-active">
          <div className="modal-background"></div>
          <div className="modal-content is-flex is-justify-content-center">
            <VoteConfirmedModal onConfirmCastVote={onConfirmCastVote} />
          </div>
        </div>
      )}
      <StrategyModal
        isOpen={isStrategyModalOpen}
        closeModal={closeStrategyModal}
        strategy={!strategiesError ? proposalStrategy : {}}
      />
      <section className="section">
        <div className="container">
          <HeaderNavigation
            communityId={proposal.communityId}
            proposalId={proposal.id}
            proposalName={proposal.name}
          />
          {cancelled && (
            <Message messageText={`This proposal has been cancelled`} />
          )}
          {/* Mobile version for tabs */}
          {!isNotMobile && (
            <div>
              <WrapperResponsive
                as="h2"
                classNames="title my-5 is-4 has-text-black has-text-weight-normal"
              >
                {proposal.name}
              </WrapperResponsive>
              <div
                className="is-flex is-align-items-center"
                style={{ marginBottom: '35px' }}
              >
                <CommunityName
                  communityId={proposal.communityId}
                  classNames="mr-3"
                />
                <StyledStatusPill
                  status={FilterValues[proposal.computedStatus]}
                />
              </div>
              <div className="tabs is-medium">
                <ul>
                  <li className={`${visibleTab.proposal ? 'is-active' : ''}`}>
                    <Tablink
                      className="has-text-weight-bold"
                      linkText="Proposal"
                      onClick={setTab('proposal')}
                      isActive={visibleTab.proposal}
                      onlyLink
                    />
                  </li>
                  <li className={`${visibleTab.summary ? 'is-active' : ''}`}>
                    <Tablink
                      className="has-text-weight-bold"
                      linkText="Results & Details"
                      onClick={setTab('summary')}
                      isActive={visibleTab.summary}
                      onlyLink
                    />
                  </li>
                </ul>
              </div>
              <div className="columns is-mobile m-0">
                {visibleTab.proposal && (
                  <div
                    className={`column is-full p-0 is-flex is-flex-direction-column`}
                  >
                    {proposal.body && (
                      <div
                        className="mt-4 mb-6 proposal-copy content"
                        dangerouslySetInnerHTML={{
                          __html: htmlBody,
                        }}
                      />
                    )}
                    {proposal.strategy === 'bpt' && (
                      <div className="mt-6 mb-6 has-background-white-ter has-text-grey p-5 rounded-sm">
                        This snapshot was re-uploaded with the BPT token
                        strategy, allowing for BANK holders to vote with tokens
                        held in Balancer's liquidity pools.
                      </div>
                    )}
                    <VoteOptions
                      labelType="mobile"
                      addr={user?.addr}
                      proposal={proposal}
                      optionChosen={optionChosen}
                      castVote={castVote}
                      onOptionSelect={onOptionSelect}
                      onConfirmVote={onConfirmVote}
                    />
                    <VotesList proposalId={proposalId} castVote={castVote} />
                  </div>
                )}
                {visibleTab.summary && (
                  <div
                    className={`column is-full p-0 is-flex is-flex-direction-column`}
                    style={{ position: 'relative' }}
                  >
                    <div
                      className="has-background-white-ter"
                      style={{
                        position: 'absolute',
                        backgroundColor: 'blue',
                        width: '100vw',
                        overflow: 'hidden',
                        left: '-1rem',
                        zIndex: -1,
                        height: '600px',
                        top: '-1.5rem',
                      }}
                    />
                    <ProposalInformation
                      proposalId={proposal.id}
                      proposalChoices={proposal.choices}
                      creatorAddr={proposal.creatorAddr}
                      isCoreCreator={proposal.isCore}
                      strategyName={proposalStrategy?.name}
                      ipfs={proposal.ipfs}
                      ipfsUrl={proposal.ipfsUrl}
                      startTime={proposal.startTime}
                      endTime={proposal.endTime}
                      computedStatus={proposal.computedStatus}
                      communityId={proposal.communityId}
                      openStrategyModal={openStrategyModal}
                      proposalStrategy={proposalStrategy}
                      votingStrategies={votingStrategies}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Desktop version with no tabs */}
          {isNotMobile && (
            <div className="columns m-0 is-justify-content-space-between">
              <div
                className={`column is-7 p-0 is-flex is-flex-direction-column`}
              >
                <h1 className="title is-3 mb-0">{proposal.name}</h1>
                <div className="is-flex is-justify-content-space-between column px-0">
                  <div className="is-flex is-align-items-center">
                    <CommunityName
                      communityId={proposal.communityId}
                      classNames="mr-3"
                    />
                    <StyledStatusPill
                      status={FilterValues[proposal.computedStatus]}
                    />
                  </div>
                  {showCancelButton && canCancelProposal && (
                    <div className="is-flex is-align-items-center">
                      <button
                        className="button is-white has-text-grey small-text"
                        onClick={onCancelProposal}
                      >
                        <div className="mr-2 is-flex is-align-items-center">
                          <Svg name="Bin" />
                        </div>
                        <div className="is-flex is-align-items-center is-hidden-mobile">
                          Cancel Proposal
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {proposal.body && (
                  <div
                    style={
                      isCollapsed
                        ? { position: 'relative', marginBottom: '80px' }
                        : {}
                    }
                  >
                    <div
                      className={`mt-5 ${
                        !isCollapsed ? 'mb-6 ' : ''
                      }proposal-copy transition-all content`}
                      dangerouslySetInnerHTML={{
                        __html: htmlBody,
                      }}
                      ref={descriptionRef}
                      style={
                        isCollapsed
                          ? {
                              maxHeight: '300px',
                              overflow: 'hidden',
                            }
                          : {}
                      }
                    />
                    {isCollapsed && (
                      <>
                        <div className="fade-proposal-description" />
                        <div className="is-flex flex-1 is-justify-content-center">
                          <div
                            className="button rounded-xl is-flex has-text-weight-bold has-background-white px-6"
                            style={{ minHeight: '48px', position: 'absolute' }}
                            onClick={() => setIsCollapsed(false)}
                          >
                            View Full Proposal
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
                {proposal.strategy === 'bpt' && (
                  <div className="mt-6 mb-6 has-background-white-ter has-text-grey p-5 rounded-sm">
                    This snapshot was re-uploaded with the BPT token strategy,
                    allowing for BANK holders to vote with tokens held in
                    Balancer's liquidity pools.
                  </div>
                )}
                <VoteOptions
                  labelType="desktop"
                  loggedIn={user?.loggedIn}
                  addr={user?.addr}
                  proposal={proposal}
                  onOptionSelect={onOptionSelect}
                  optionChosen={optionChosen}
                  castVote={castVote}
                  onConfirmVote={onConfirmVote}
                />
                <VotesList proposalId={proposalId} castVote={castVote} />
              </div>
              <div className="column p-0 is-4">
                <ProposalInformation
                  proposalId={proposal.id}
                  proposalChoices={proposal.choices}
                  creatorAddr={proposal.creatorAddr}
                  isCoreCreator={proposal.isCore}
                  strategyName={proposalStrategy?.name || proposal.strategy}
                  ipfs={proposal.ipfs}
                  ipfsUrl={proposal.ipfsUrl}
                  startTime={proposal.startTime}
                  endTime={proposal.endTime}
                  computedStatus={proposal.computedStatus}
                  communityId={proposal.communityId}
                  proposalStrategy={proposalStrategy}
                  proposalMaxWeight={proposal?.maxWeight}
                  proposalMinBalance={proposal?.minBalance}
                  openStrategyModal={openStrategyModal}
                  votingStrategies={votingStrategies}
                />
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
