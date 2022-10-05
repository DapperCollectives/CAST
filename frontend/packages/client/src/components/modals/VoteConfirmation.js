import Modal from './Modal';

export default function VoteConfirmation({ onCancelVote, onVote, voteLabel }) {
  return (
    <Modal>
      <Modal.Header title="Confirm Vote" onClose={onCancelVote} />
      <Modal.BodyContainer>
        <section className="modal-card-body has-background-white-ter">
          <div className="px-4">
            <p>Are you sure this is your final vote?</p>
            <p className="has-text-grey mb-4">This action cannot be undone.</p>
            <div className="py-4 px-5 rounded-sm has-background-white">
              {voteLabel}
            </div>
          </div>
        </section>
      </Modal.BodyContainer>
      <Modal.FooterContainer>
        <>
          <div className="columns is-mobile p-0 m-0 flex-1 pr-2">
            <button
              className="button column is-full p-0 rounded-xl"
              onClick={onCancelVote}
            >
              Cancel
            </button>
          </div>
          <div className="columns is-mobile p-0 m-0 flex-1 pl-2">
            <Modal.FooterButton
              classNames="has-background-yellow"
              onClick={onVote}
              text="Vote"
            />
          </div>
        </>
      </Modal.FooterContainer>
    </Modal>
  );
}
