import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Svg } from '@cast/shared-components';
import Input from 'components/common/Input';
import { yupResolver } from '@hookform/resolvers/yup';
import { getSchema } from './FormConfig';
import NotificationsError from './NotificationsError';

const SignUpForm = ({ setErrorMessage, onSubscribe, communityId, onClose }) => {
  const [signupAll, setSignupAll] = useState(false);

  const { register, handleSubmit, formState } = useForm({
    resolver: yupResolver(getSchema()),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async () => {
    try {
      onSubscribe(communityId, signupAll);
      onClose();
    } catch (e) {
      setErrorMessage(e.message);
    }
  };

  const { isSubmitting, errors } = formState;
  const fadeClass = isSubmitting ? 'fade-out-half is-disabled' : '';

  return (
    <div className="has-background-white rounded-sm">
      <div className={fadeClass}>
        <header
          className="modal-card-head has-background-white pb-0"
          style={{ borderBottom: 'none' }}
        >
          <div className="is-flex is-align-items-center flex-1">
            <h2 className="is-size-4 is-capitalized">stay up to date</h2>
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
            Add your email to receive updates on when proposals are created or
            end.
          </p>

          <form className="is-flex mt-4" onSubmit={handleSubmit(onSubmit)}>
            <div style={{ marginTop: 8 }}>
              <Svg name="Email" />
            </div>
            <div className="flex-1 pl-2">
              <Input
                placeholder="Enter Email Address"
                register={register}
                name="email"
                classNames="rounded-sm border-light p-3 column is-full is-full-mobile"
                disabled={isSubmitting}
                error={errors?.email}
              />
            </div>
          </form>
          <div className="has-background-light-grey p-2 mt-4 rounded-sm">
            <div className="is-flex">
              <div className="flex-1 is-flex is-align-items-center">
                <p className="small-text">
                  <b>Subscribe to updates from all of your communities</b>
                </p>
              </div>
              <div className="field">
                <input
                  id="switchRoundedDefault"
                  type="checkbox"
                  name="switchRoundedDefault"
                  className="switch is-rounded"
                  checked={signupAll}
                  onChange={() => setSignupAll(!signupAll)}
                />
                <label htmlFor="switchRoundedDefault" />
              </div>
            </div>
          </div>
          <div className="is-flex mt-4">
            <button
              className="button rounded-lg is-outlined px-3 flex-1 mr-2"
              onClick={onClose}
            >
              <b>Close</b>
            </button>
            <button
              className="button is-primary rounded-lg px-3 flex-1 ml-2"
              onClick={handleSubmit(onSubmit)}
            >
              <b>Save</b>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default function NotificationsSignUp(props) {
  const [errorMessage, setErrorMessage] = useState('');

  if (errorMessage) {
    return (
      <NotificationsError message={errorMessage} onClose={props.onClose} />
    );
  }

  return <SignUpForm setErrorMessage={setErrorMessage} {...props} />;
}
