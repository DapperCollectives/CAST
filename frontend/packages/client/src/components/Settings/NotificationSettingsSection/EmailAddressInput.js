import { Fragment, useState } from 'react';
import { useNotificationServiceContext } from 'contexts/NotificationService';

const EMAIL_REGEX = /^\S+@\S+\.\S+$/i;
export default function EmailAddressInput() {
  const { notificationSettings, setUserEmail } =
    useNotificationServiceContext();
  const { email } = notificationSettings;

  const [newEmail, setNewEmail] = useState(email);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const handleSaveEmail = () => {
    if (EMAIL_REGEX.test(newEmail) && newEmail.length > 0) {
      setIsEmailValid(true);
      setUserEmail(newEmail);
    } else {
      setIsEmailValid(false);
    }
  };
  const isEmailChanged = newEmail !== email;
  return (
    <Fragment>
      <h3 className="is-size-5 mt-2 has-text-weight-medium">Email Address</h3>
      <div className="is-flex is-flex-direction-row is-flex-wrap-wrap is-align-items-center">
        <div className="mr-3 my-3">
          <input
            className="rounded-lg border-light flex-1 p-3"
            style={{ height: 41, width: 246 }}
            value={newEmail}
            onChange={(e) => {
              setNewEmail(e.target.value);
            }}
          />
        </div>
        <button
          className={`button rounded-lg has-background-black has-text-white ${
            isEmailChanged ? '' : 'is-disabled'
          }`}
          disabled={!isEmailChanged}
          onClick={handleSaveEmail}
        >
          Save
        </button>
      </div>
      {!isEmailValid && (
        <p className="is-size-7 p-2">Please enter a valid email address</p>
      )}
    </Fragment>
  );
}
