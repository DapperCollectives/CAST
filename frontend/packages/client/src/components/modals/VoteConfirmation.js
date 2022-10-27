import Modal from './Modal';

export default function VoteConfirmation({ onCancelVote, onVote, castVotes }) {
  return (
    <Modal>
      <Modal.Header title="Confirm Vote" onClose={onCancelVote} />
      <Modal.BodyContainer>
        <section className="modal-card-body has-background-white p-0">
          <div className="py-4 px-5 medium-text">
            <p>Are you sure this is your final vote?</p>
            <p className="has-text-grey">This action cannot be undone.</p>
          </div>
          <div className="has-background-light-grey p-5">
            <div className="">{castVotes}</div>
          </div>
        </section>
      </Modal.BodyContainer>
      <Modal.FooterContainer>
        <>
          <div className="columns is-mobile p-0 m-0 flex-1 pr-2">
            <Modal.FooterButton
              classNames="has-background-white"
              onClick={onCancelVote}
              text="Cancel"
            />
          </div>
          <div className="columns is-mobile p-0 m-0 flex-1 pl-2">
            <Modal.FooterButton
              classNames="has-background-yellow vote-button transition-all"
              onClick={onVote}
              text="Vote"
            />
          </div>
        </>
      </Modal.FooterContainer>
    </Modal>
  );
}
