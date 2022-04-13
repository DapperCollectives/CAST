import React, { useState, useCallback } from "react";
import { Loader } from "../../components";

const CancelProposalModalConfirmation = ({
  proposalName,
  onDismiss = () => {},
  onCancelProposal = () => {},
}) => {
  const [isCancelling, setIsCancelling] = useState(false);

  const _onCancelProposal = useCallback(async () => {
    setIsCancelling(true);
    await onCancelProposal();
    setIsCancelling(false);
  }, [onCancelProposal]);

  const _onDismiss = useCallback(() => {
    if (!isCancelling) {
      return onDismiss();
    }
  }, [isCancelling, onDismiss]);

  return (
    <div className="modal-card m-0">
      <header
        className="modal-card-head has-background-white is-flex-direction-column columns is-mobile pb-0 m-0"
        style={{ borderBottom: "none" }}
      >
        <div
          className={`column is-full has-text-right is-size-2 p-0 leading-tight cursor-pointer ${
            isCancelling && "has-text-grey"
          }`}
          onClick={_onDismiss}
        >
          &times;
        </div>
      </header>
      <section className="modal-card-body" style={{ minHeight: "120px" }}>
        {!isCancelling && (
          <>
            <div className="column is-full has-text-left px-4">
              <p className="modal-card-title">Cancel Proposal</p>
            </div>
            <div className="px-4 pb-2">
              <p>
                Are you sure you want to cancel the {proposalName} proposal?
              </p>
            </div>
          </>
        )}
        {isCancelling && (
          <div
            className="is-flex flex-1 is-flex-direction-column is-align-items-center is-justify-content-center"
            style={{ height: "100%" }}
          >
            <Loader className="mb-4" />
            <p className="has-text-grey">Cancelling Proposal...</p>
          </div>
        )}
      </section>
      <footer className="modal-card-foot has-background-white py-5">
        <div className="columns is-flex p-0 m-0 flex-1 is-justify-content-end">
          <button
            className={`button column is-4 is-flex-mobile is-6-mobile p-0 is-uppercase ${
              isCancelling && "is-disabled"
            }`}
            onClick={onDismiss}
          >
            Dismiss
          </button>
          <button
            className={`button column is-4 is-flex-mobile is-6-mobile p-0 has-background-yellow is-uppercase ${
              isCancelling && "is-disabled"
            }`}
            onClick={_onCancelProposal}
          >
            Cancel Proposal
          </button>
        </div>
      </footer>
    </div>
  );
};

export default CancelProposalModalConfirmation;
