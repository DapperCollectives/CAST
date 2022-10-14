import { Svg } from '@cast/shared-components';

const NotificationsError = ({ message, onClose }) => (
  <div className="has-background-white rounded-sm">
    <header className="modal-card-head has-background-white m-0">
      <div className="is-flex is-align-items-center flex-1">
        <Svg name="InvalidCheckMark" />
        <h2 className="is-size-4 is-capitalized ml-3">error</h2>
      </div>
      <div
        className="cursor-pointer is-flex is-align-items-center"
        onClick={onClose}
      >
        <Svg name="Close" />
      </div>
    </header>
    <section className="modal-card-body p-4">
      <p className="has-text-grey is-size-5">{message}</p>
      <div className="is-flex mt-4">
        <button
          className="button rounded-lg is-outlined px-3 flex-1 mr-2"
          onClick={onClose}
        >
          <b>Close</b>
        </button>
      </div>
    </section>
  </div>
);

export default NotificationsError;
