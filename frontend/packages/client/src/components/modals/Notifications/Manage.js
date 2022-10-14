import { Link } from 'react-router-dom';
import { Svg } from '@cast/shared-components';

const NotificationsManage = ({ onClose }) => (
  <div className="has-background-white rounded-sm">
    <header className="modal-card-head has-background-white m-0">
      <div className="is-flex is-align-items-center flex-1">
        <h2 className="is-size-4 is-capitalized">manage notifications</h2>
      </div>
      <div
        className="cursor-pointer is-flex is-align-items-center"
        onClick={onClose}
      >
        <Svg name="Close" />
      </div>
    </header>
    <section className="modal-card-body p-4">
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
  </div>
);

export default NotificationsManage;
