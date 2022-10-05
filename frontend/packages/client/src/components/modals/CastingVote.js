import { Loader } from 'components';
import Modal from './Modal';

export default function CastingVote() {
  return (
    <Modal>
      <Modal.BodyContainer>
        <section
          className="modal-card-body p-6 has-text-centered"
          style={{
            margin: '150px 0',
          }}
        >
          <Loader className="mb-4" />
          <p className="has-text-grey">Casting your vote...</p>
        </section>
      </Modal.BodyContainer>
    </Modal>
  );
}
