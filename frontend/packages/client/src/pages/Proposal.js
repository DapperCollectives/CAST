import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import millify from "millify";
import {
  Message,
  VotesList,
  StrategyModal,
  ProposalInformation,
  WalletConnect,
  Error,
  Loader,
  WrapperResponsive as Wrapper,
  WrapperResponsive,
} from "../components";
import { CheckMark, ArrowLeft, Bin } from "../components/Svg";
import { parseDateFromServer, isNotEmptyArray } from "../utils";
import {
  useProposal,
  useProposalVotes,
  useVotesForAddress,
  useVotingStrategies,
} from "../hooks";
import { useModalContext } from "../contexts/NotificationModal";
import { useWebContext } from "../contexts/Web3";
import { getStatus } from "../components/Proposals/ProposalHeader";
import { FilterValues } from "../components/Proposals";
// @todo: move this import and component to components folder
import StatusLabel from "../components/Proposals/StatusLabel";
import Tablink from "../components/Proposals/Tablink";
import { CancelProposalModalConfirmation } from "../components/Proposal";

export const ProposalStatus = ({ proposal, className = "" }) => {
  const { diffFromNow: endDiff, diffDays } = parseDateFromServer(
    proposal.endTime
  );
  const { diffFromNow: startDiff } = parseDateFromServer(proposal.startTime);

  const calculatedStatus = getStatus(
    startDiff,
    endDiff,
    proposal?.computedStatus
  );

  if (
    calculatedStatus === FilterValues.active ||
    calculatedStatus === FilterValues.pending
  ) {
    return (
      <div className={className}>
        <code className="has-text-grey pl-0">
          {calculatedStatus === FilterValues.active && (
            <StatusLabel
              margin="mr-3"
              status={<b>Active</b>}
              color="has-background-orange"
              className="smaller-text"
            />
          )}
          {calculatedStatus === FilterValues.pending && (
            <StatusLabel
              margin="mr-3"
              status={<b>Pending</b>}
              color="has-background-grey-light"
              className="smaller-text"
            />
          )}
          <span style={{ lineHeight: "18.8px" }} className="smaller-text">
            Ends in {diffDays} days
          </span>
        </code>
      </div>
    );
  }

  if (calculatedStatus === FilterValues.cancelled) {
    return (
      <div className={className}>
        <code className="has-text-grey pl-0">
          <StatusLabel
            status={<b>Cancelled</b>}
            color="has-background-grey"
            className="smaller-text"
          />
        </code>
      </div>
    );
  }

  return (
    <div className={className}>
      <code className="has-text-grey pl-0 smaller-text">
        ✓ Closed - Final Decision {millify(proposal?.winCount || 0)}
      </code>
    </div>
  );
};

export const VoteOptions = ({
  labelType,
  proposal,
  onOptionSelect,
  optionChosen,
  castVote,
  onConfirmVote,
  addr,
  readOnly = false,
}) => {
  const { diffFromNow: endDiff } = parseDateFromServer(proposal.endTime);
  const { diffFromNow: startDiff } = parseDateFromServer(proposal.startTime);

  const status = getStatus(startDiff, endDiff, proposal?.computedStatus);

  const isActive = status === FilterValues.active;

  const { getVotesForAddress, data, loading } = useVotesForAddress();

  const votesFromAddress = data?.[addr];
  const checkedVotes = Array.isArray(votesFromAddress);

  useEffect(() => {
    async function getVotes() {
      getVotesForAddress([proposal.id], addr);
    }
    if (addr && !loading && proposal.id && !checkedVotes) {
      getVotes();
    }
  }, [addr, proposal, loading, getVotesForAddress, checkedVotes]);

  const hasntVoted =
    !castVote &&
    checkedVotes &&
    votesFromAddress.every(
      (voteObj) => String(proposal.id) !== Object.keys(voteObj)[0]
    );
  const canVote = addr && isActive && checkedVotes && hasntVoted;

  const voteClasses = `vote-options border-light rounded-sm mb-6 ${
    !canVote && "is-disabled"
  } ${!hasntVoted && "is-voted"}`;

  let previousVote = castVote;
  let currentOption = optionChosen;
  if (
    !hasntVoted &&
    Array.isArray(votesFromAddress) &&
    votesFromAddress.length
  ) {
    const previousVoteObj = votesFromAddress.find(
      (voteObj) => Object.keys(voteObj)[0] === String(proposal.id)
    );
    const voteOption = previousVoteObj?.[String(proposal.id)];
    previousVote = voteOption;
    currentOption = voteOption;
  }
  return (
    <div className={voteClasses}>
      <Wrapper
        extraClasses="px-6 pt-5 pb-6"
        extraClassesMobile="px-4 pt-5 pb-6"
      >
        <h3 className="is-size-5" style={{ lineHeight: "24px" }}>
          Cast your vote
        </h3>
        <p
          className="has-text-grey small-text pt-2"
          style={{ lineHeight: "19.6px" }}
        >
          Secondary information about voting.
        </p>
      </Wrapper>

      <Wrapper
        extraClasses="has-background-white-ter p-6"
        extraClassesMobile="has-background-white-ter p-4"
      >
        {proposal.choices.map((opt, i) => (
          <Wrapper
            key={`proposal-option-${i}`}
            commonClasses="has-background-white border-light option-vote transition-all rounded-sm py-5 px-4"
            extraClasses={proposal?.choices?.length !== i + 1 ? "mb-5" : {}}
            extraStylesMobile={
              proposal?.choices?.length !== i + 1
                ? { marginBottom: "14px" }
                : {}
            }
          >
            <label className="radio is-flex">
              <input
                type="radio"
                name={`${labelType}-${opt.value}`}
                value={opt.value}
                className={`mr-3 ${
                  String(currentOption) === String(opt.value) &&
                  String(previousVote) === String(opt.value) &&
                  "is-chosen"
                }`}
                onChange={readOnly ? () => {} : onOptionSelect}
                checked={currentOption === String(opt.value)}
              />
              <span />
              <div className="has-text-black" style={{ lineHeight: "22.4px" }}>
                {opt.label}
              </div>
            </label>
          </Wrapper>
        ))}
      </Wrapper>
      {!previousVote && (
        <Wrapper
          commonClasses="py-5"
          extraClasses="px-6"
          extraClassesMobile="px-4"
        >
          <button
            style={{ height: 48, width: "100%" }}
            className={`button vote-button transition-all is-flex has-background-yellow rounded-sm is-${
              currentOption && !readOnly ? "enabled" : "disabled"
            }`}
            onClick={readOnly ? () => {} : onConfirmVote}
          >
            VOTE
          </button>
        </Wrapper>
      )}
    </div>
  );
};

const VoteUserError = () => (
  <div className="columns m-0 p-0 is-multiline is-mobile">
    <div className="column is-full m-0 p-0 is-flex is-justify-content-center py-5">
      <div
        className="rounded-full is-size-2 has-text-white is-flex is-align-items-center is-justify-content-center"
        style={{ height: 50, width: 50, background: "red" }}
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

export default function Proposal() {
  const [optionChosen, setOptionChosen] = useState(null);
  const [confirmingVote, setConfirmingVote] = useState(false);
  const [castingVote, setCastingVote] = useState(false);
  const [castVote, setCastVote] = useState(null);
  const [voteError, setVoteError] = useState(null);
  const [cancelProposal, setCancelProposal] = useState(null);
  const [cancelled, setCancelled] = useState(false);
  const [visibleTab, setVisibleTab] = useState({
    proposal: true,
    summary: false,
  });
  const [isStrategyModalOpen, setIsStrategyModalOpen] = useState(false);

  const modalContext = useModalContext();
  const { isLedger, user, injectedProvider } = useWebContext();
  const { proposalId } = useParams();

  const {
    getProposal,
    voteOnProposal,
    updateProposal,
    loading,
    data: proposal,
  } = useProposal();
  const {
    loading: loadingStrategies,
    data: votingStrategies,
    error: strategiesError,
  } = useVotingStrategies();

  const isAdmin = proposal && proposal?.creatorAddr === user?.addr;

  const proposalStrategy =
    votingStrategies && !loadingStrategies && proposal && !loading
      ? votingStrategies.find(
          (votStrategy) => votStrategy.key === proposal.strategy
        ) || {
          // fallback if no match
          description: proposal.strategy,
          key: proposal.strategy,
          name: proposal.strategy,
        }
      : {};

  useEffect(() => {
    (async () => {
      await getProposal(proposalId);
    })();
  }, [proposalId, getProposal]);

  useEffect(() => {
    if (modalContext.isOpen && user?.addr && !voteError && !cancelProposal) {
      modalContext.closeModal();
    }
  }, [modalContext, user, voteError, cancelProposal]);

  const openStrategyModal = () => {
    setIsStrategyModalOpen(true);
  };

  const closeStrategyModal = () => {
    setIsStrategyModalOpen(false);
  };

  const onOptionSelect = (event) => {
    setOptionChosen(event?.target?.value);
  };

  const onConfirmVote = () => {
    setConfirmingVote(true);
  };

  const onCancelVote = () => {
    setConfirmingVote(false);
  };

  const onCancelProposal = async () => {
    if (!proposal) {
      return;
    }
    setCancelProposal(true);

    const onDismiss = () => {
      setCancelProposal(false);
      modalContext.closeModal();
    };

    const onCancelProposal = async () => {
      const response = await updateProposal(injectedProvider, proposal, {
        status: "cancelled",
      });
      if (response.error) {
        return;
      }
      setCancelProposal(false);
      setCancelled(true);
    };
    modalContext.openModal(
      <CancelProposalModalConfirmation
        onDismiss={onDismiss}
        onCancelProposal={onCancelProposal}
        proposalName={proposal.name}
      />,
      {
        showCloseButton: false,
        classNameModalContent: "rounded-sm",
      }
    );
  };

  const onVote = async () => {
    if (!user || !user.addr) {
      setConfirmingVote(false);
      modalContext.openModal(VoteUserError);
      return;
    }

    const voteBody = {
      choice: optionChosen,
      addr: user.addr,
    };

    setCastingVote(true);
    const response = await voteOnProposal(injectedProvider, proposal, voteBody, isLedger, user);
    if (response?.error) {
      setVoteError(response.error);
      setConfirmingVote(false);
      modalContext.openModal(
        React.createElement(Error, {
          error: (
            <p className="has-text-red">
              <b>{response.error}</b>
            </p>
          ),
          errorTitle: "Something went wrong with your vote.",
        })
      );
      setCastingVote(false);
      return;
    } else {
      setCastingVote(false);
      setConfirmingVote(false);
      setCastVote(optionChosen);
    }
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

  const maxModalWidth = 400;

  const showCancelButton = ![
    FilterValues.cancelled.toLocaleLowerCase(),
    FilterValues.closed.toLocaleLowerCase(),
  ].includes(proposal?.computedStatus);

  const setTab = (tab) => () => {
    setVisibleTab({
      proposal: tab === "proposal",
      summary: tab === "summary",
    });
  };

  // calculate what to show in vote options
  const isClosed =
    proposal?.computedStatus === FilterValues.closed.toLocaleLowerCase();

  const {
    getAllProposalVotes,
    resetResults,
    loading: loadingVotes,
    data: votes,
  } = useProposalVotes({ proposalId });

  useEffect(() => {
    if (isClosed) {
      (async () => {
        resetResults();
        await getAllProposalVotes();
      })();
    }
  }, [getAllProposalVotes, resetResults, isClosed]);

  if (loading || loadingVotes) {
    return null;
  }

  let optionsReadOnly = false;
  let optionToUse = optionChosen;
  let voteToUse = castVote;

  if (isClosed && isNotEmptyArray(votes)) {
    const optionMap = {};
    votes.forEach((vote) => {
      if (!optionMap[vote.choice]) {
        optionMap[vote.choice] = 0;
      }
      optionMap[vote.choice] += 1;
    });
    const sortedChoices = Object.keys(optionMap).sort(
      (a, b) => optionMap[a] - optionMap[b]
    );
    optionsReadOnly = true;
    optionToUse = sortedChoices[0];
    voteToUse = sortedChoices[0];
  }

  const htmlBody = proposal?.body
    ?.replace(/target="_self"/g, 'target="_blank" rel="noopener noreferrer"')
    .replace(/(?:\r\n|\r|\n)/g, "<br>");

  return (
    <>
      {confirmingVote && !castingVote && (
        <div className="modal is-active">
          <div className="modal-background"></div>
          <div className="modal-card" style={{ maxWidth: maxModalWidth }}>
            <header className="modal-card-head is-flex-direction-column has-background-white columns is-mobile m-0">
              <div
                className="column is-full has-text-right is-size-2 p-0 leading-tight cursor-pointer"
                onClick={onCancelVote}
              >
                &times;
              </div>
              <div className="column is-full has-text-left px-4">
                <p className="modal-card-title">Confirm Vote</p>
              </div>
            </header>
            <section className="modal-card-body has-background-white-ter">
              <div className="px-4">
                <p>Are you sure this is your final vote?</p>
                <p className="has-text-grey mb-4">
                  This action cannot be undone.
                </p>
                <div className="py-4 px-5 rounded-sm has-background-white">
                  {getVoteLabel(optionChosen)}
                </div>
              </div>
            </section>
            <footer className="modal-card-foot has-background-white pb-6">
              <div className="columns is-mobile p-0 m-0 flex-1 pr-2">
                <button
                  className="button column is-full p-0 is-uppercase"
                  onClick={onCancelVote}
                >
                  Cancel
                </button>
              </div>
              <div className="columns is-mobile p-0 m-0 flex-1 pl-2">
                <button
                  className="button column is-full p-0 has-background-yellow is-uppercase vote-button transition-all"
                  onClick={onVote}
                >
                  Vote
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}
      {confirmingVote && castingVote && !castVote && (
        <div className="modal is-active">
          <div className="modal-background"></div>
          <div
            className="modal-card has-background-white"
            style={{ maxWidth: maxModalWidth }}
          >
            <section
              className="modal-card-body p-6 has-text-centered"
              style={{
                margin: "150px 0",
              }}
            >
              <Loader className="mb-4" />
              <p className="has-text-grey">Casting your vote...</p>
            </section>
          </div>
        </div>
      )}
      {confirmingVote && castingVote && castVote && (
        <div className="modal is-active">
          <div className="modal-background"></div>
          <div className="modal-card" style={{ maxWidth: maxModalWidth }}>
            <header className="modal-card-head is-flex-direction-column has-background-white columns is-mobile m-0">
              <div
                className="column is-full has-text-right is-size-2 p-0 leading-tight cursor-pointer"
                onClick={onConfirmCastVote}
              >
                &times;
              </div>
              <div className="column is-full has-text-left px-4">
                <p className="modal-card-title">Your voting was successful!</p>
              </div>
            </header>
            <section className="modal-card-body">
              <p className="px-4 has-text-grey">You voted for this proposal</p>
            </section>
            <footer className="modal-card-foot">
              <button
                className="button column is-full has-background-yellow is-uppercase"
                onClick={onConfirmCastVote}
              >
                Got it
              </button>
            </footer>
          </div>
        </div>
      )}
      <StrategyModal
        isOpen={isStrategyModalOpen}
        closeModal={closeStrategyModal}
        strategies={!strategiesError ? [proposalStrategy] : []}
      />
      <section className="section">
        <div className="container">
          <WrapperResponsive extraClasses="mb-6" extraClassesMobile="mb-3">
            <Link to={`/community/${proposal.communityId}`}>
              <span className="has-text-grey is-flex is-align-items-center back-button transition-all">
                <ArrowLeft /> <span className="ml-3">Back</span>
              </span>
            </Link>
          </WrapperResponsive>
          {castVote && (
            <Message
              messageText={`You successfully voted for ${getVoteLabel(
                castVote
              )}`}
              icon={<CheckMark />}
            />
          )}
          {cancelled && (
            <Message messageText={`This proposal has been cancelled`} />
          )}
          <div className="is-flex is-justify-content-space-between column is-7 px-0">
            <ProposalStatus
              proposal={proposal}
              className="is-flex is-align-items-center smaller-text"
            />
            {showCancelButton && isAdmin && (
              <div className="is-flex is-align-items-center">
                <button
                  className="button is-white is-text-grey small-text"
                  onClick={onCancelProposal}
                >
                  <div className="mr-2 is-flex is-align-items-center">
                    <Bin />
                  </div>
                  <div className="is-flex is-align-items-center is-hidden-mobile">
                    Cancel Proposal
                  </div>
                </button>
              </div>
            )}
          </div>
          {/* Mobile version for tabs */}
          <div className="is-hidden-tablet">
            <WrapperResponsive
              as="h2"
              commonClasses="title mt-5 is-4 has-text-back has-text-weight-normal"
              extraStylesMobile={{ marginBottom: "30px" }}
            >
              {proposal.name}
            </WrapperResponsive>
            <div className="tabs is-medium">
              <ul>
                <li className={`${visibleTab.proposal ? "is-active" : ""}`}>
                  <Tablink
                    linkText="Proposal"
                    onClick={setTab("proposal")}
                    isActive={visibleTab.proposal}
                    onlyLink
                  />
                </li>
                <li className={`${visibleTab.summary ? "is-active" : ""}`}>
                  <Tablink
                    linkText="Summary"
                    onClick={setTab("summary")}
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
                      className="mt-4 mb-6 proposal-copy"
                      dangerouslySetInnerHTML={{
                        __html: htmlBody,
                      }}
                    />
                  )}
                  {proposal.strategy === "bpt" && (
                    <div className="mt-6 mb-6 has-background-white-ter has-text-grey p-5 rounded-sm">
                      This snapshot was re-uploaded with the BPT token strategy,
                      allowing for BANK holders to vote with tokens held in
                      Balancer's liquidity pools.
                    </div>
                  )}
                  <VoteOptions
                    labelType="mobile"
                    readOnly={optionsReadOnly}
                    addr={user?.addr}
                    proposal={proposal}
                    onOptionSelect={onOptionSelect}
                    optionChosen={optionToUse}
                    castVote={voteToUse}
                    onConfirmVote={onConfirmVote}
                  />
                  <VotesList proposalId={proposalId} castVote={castVote} />
                </div>
              )}
              {visibleTab.summary && (
                <div
                  className={`column is-full p-0 is-flex is-flex-direction-column`}
                >
                  <ProposalInformation
                    proposalId={proposal.id}
                    creatorAddr={proposal.creatorAddr}
                    isCoreCreator={proposal.isCore}
                    strategies={[proposalStrategy]}
                    ipfs={proposal.ipfs}
                    ipfsUrl={proposal.ipfsUrl}
                    startTime={proposal.startTime}
                    endTime={proposal.endTime}
                    openStrategyModal={openStrategyModal}
                  />
                </div>
              )}
            </div>
          </div>
          {/* Desktop version with no tabs */}
          <div className="is-hidden-mobile columns m-0 is-justify-content-space-between">
            <div className={`column is-7 p-0 is-flex is-flex-direction-column`}>
              <h1 className="title mt-5 is-3">{proposal.name}</h1>
              {proposal.body && (
                <div
                  className="mt-6 mb-6 proposal-copy transition-all"
                  dangerouslySetInnerHTML={{
                    __html: htmlBody,
                  }}
                />
              )}
              {proposal.strategy === "bpt" && (
                <div className="mt-6 mb-6 has-background-white-ter has-text-grey p-5 rounded-sm">
                  This snapshot was re-uploaded with the BPT token strategy,
                  allowing for BANK holders to vote with tokens held in
                  Balancer's liquidity pools.
                </div>
              )}
              <VoteOptions
                labelType="desktop"
                readOnly={optionsReadOnly}
                addr={user?.addr}
                proposal={proposal}
                onOptionSelect={onOptionSelect}
                optionChosen={optionToUse}
                castVote={voteToUse}
                onConfirmVote={onConfirmVote}
              />
              <VotesList proposalId={proposalId} castVote={castVote} />
            </div>
            <div className="column p-0 is-4">
              <ProposalInformation
                proposalId={proposal.id}
                creatorAddr={proposal.creatorAddr}
                isCoreCreator={proposal.isCore}
                strategies={[proposalStrategy]}
                ipfs={proposal.ipfs}
                ipfsUrl={proposal.ipfsUrl}
                startTime={proposal.startTime}
                endTime={proposal.endTime}
                openStrategyModal={openStrategyModal}
                className="has-background-white-ter"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
