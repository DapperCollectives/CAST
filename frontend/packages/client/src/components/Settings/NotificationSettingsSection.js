import Blockies from 'react-blockies';
import { useMediaQuery, useNotificationService } from 'hooks';

export default function NotificationSettingsSection() {
  const notMobile = useMediaQuery();
  const { notificationSettings } = useNotificationService();
  const { walletId } = notificationSettings;
  return (
    <section
      className={`column is-flex is-flex-direction-column ${
        notMobile ? 'mt-7 px-6' : 'px-5'
      }`}
    >
      <h2 className="is-size-4 has-text-weight-bold">Notification Settings</h2>
      <h3 className="is-size-5 mt-2 has-text-weight-medium">Email Address</h3>
      <div className="is-flex is-flex-direction-row is-flex-wrap-wrap is-align-items-center">
        <div className="mr-3 my-3">
          <input
            className="rounded-lg border-light flex-1 p-3"
            style={{ height: 41, width: 246 }}
            value="jose@gmail.com"
          />
        </div>
        <button
          className={`button rounded-lg has-background-black has-text-white`}
        >
          Save
        </button>
      </div>
      <hr />
      <div className="is-flex is-flex-direction-rowis-align-items-start">
        <div className="flex-2">
          <h3 className="is-size-6 has-text-weight-medium">
            Receive Email Notifications
          </h3>
          <p className="has-text-grey">
            Emails are sent when a community adds a new proposal.
          </p>
        </div>
        <div className="flex-1 has-text-right">
          <input
            id="subscribeAllNotification"
            type="checkbox"
            className="switch is-rounded is-medium"
            checked
          ></input>
          <label for="subscribeAllNotification"></label>
        </div>
      </div>
      <hr />
      <div>
        <h3
          className="is-size-6 has-text-weight-medium"
          style={{ width: '66%' }}
        >
          Edit which communities you want notifications from:
        </h3>
        <ul className="my-2">
          <li className="my-1 is-flex is-flex-direction-row has-background-light-grey rounded p-2 ">
            <div className="flex-2 is-flex is-flex-direction-row is-align-items-center">
              <Blockies
                seed={walletId}
                size={10}
                scale={4}
                className="blockies"
              />
              <p className="ml-2 is-size-6 has-text-weight-medium">
                Community Name
              </p>
            </div>
            <div>
              <input
                id="subscribeAllNotification"
                type="checkbox"
                className="switch is-rounded is-medium"
                checked
              ></input>
              <label for="subscribeAllNotification"></label>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}
