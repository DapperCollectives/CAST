import { Loader } from 'components';
import Modal from './Modal';

export default function CancelProposal({
  isCancelling,
  proposalName,
  onDismiss,
  onCancelProposal,
}) {
  return (
    <Modal>
      <Modal.Header title="Cancel Proposal" onClose={onDismiss} />
      {!isCancelling && (
        <Modal.BodyMessage
          message={`Are you sure you want to cancel the ${proposalName} proposal?`}
        />
      )}
      {isCancelling && (
        <Modal.BodyContainer>
          <div
            className="is-flex flex-1 is-flex-direction-column is-align-items-center is-justify-content-flex-end pb-2"
            style={{ height: '120px' }}
          >
            <Loader className="mb-4" />
            <p className="has-text-grey">Cancelling Proposal...</p>
          </div>
        </Modal.BodyContainer>
      )}
      <Modal.FooterContainer>
        <>
          <div className="columns is-mobile p-0 m-0 flex-1 pr-2">
            <button
              className={`button column is-full p-0 rounded-xl ${
                isCancelling && 'is-disabled'
              }`}
              onClick={isCancelling ? () => {} : onDismiss}
            >
              Dismiss
            </button>
          </div>
          <div className="columns is-mobile p-0 m-0 flex-1 pl-2">
            <Modal.FooterButton
              classNames={`has-background-yellow ${
                isCancelling && 'is-disabled'
              }`}
              onClick={isCancelling ? () => {} : onCancelProposal}
              text="Cancel Proposal"
            />
          </div>
        </>
      </Modal.FooterContainer>
    </Modal>
  );
}
