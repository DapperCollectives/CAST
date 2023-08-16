import Modal from './Modal';

export default function VoteConfirmed({ onConfirmCastVote }) {
  return (
    <Modal>
      <Modal.Header
        title="Your voting was successful!"
        onClose={onConfirmCastVote}
      />
      <Modal.BodyContainer>
        <section className="modal-card-body">
          <p className="px-4 has-text-grey">You voted for this proposal</p>
        </section>
      </Modal.BodyContainer>
      <Modal.FooterContainer>
        <Modal.FooterButton
          classNames="has-background-green"
          onClick={onConfirmCastVote}
          text="Got it"
        />
      </Modal.FooterContainer>
    </Modal>
  );
}
