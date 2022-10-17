import { Link } from 'react-router-dom';
import Modal from '../Modal';

const NotificationsManage = ({ onClose }) => (
  <Modal>
    <Modal.Header title="manage notifications" onClose={onClose} />
    <Modal.BodyContainer>
      <section className="modal-card-body">
        <p className="small-text has-text-grey">
          Notification settings can be managed on the settings page
        </p>
        <div className="is-flex mt-4">
          <button
            className="button rounded-lg is-outlined px-3 flex-1 mr-2"
            onClick={onClose}
          >
            <b>Close</b>
          </button>
          <Link
            to="/settings"
            className="button rounded-lg is-primary px-3 flex-1 mr-2"
            onClick={onClose}
          >
            <b>Settings</b>
          </Link>
        </div>
      </section>
    </Modal.BodyContainer>
  </Modal>
);

export default NotificationsManage;
