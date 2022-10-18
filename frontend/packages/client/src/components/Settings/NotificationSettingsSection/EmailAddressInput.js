import { Fragment } from 'react';
import { useForm } from 'react-hook-form';
import Input from 'components/common/Input';
import { EMAIL_REGEX } from 'const';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

export default function EmailAddressInput({ email, setUserEmail }) {
  const { register, handleSubmit, formState } = useForm({
    defaultValues: {
      email: email,
    },
    resolver: yupResolver(
      yup.object().shape({
        email: yup
          .string()
          .trim()
          .matches(EMAIL_REGEX, 'Invalid email format')
          .required('Please enter an email address'),
      })
    ),
  });
  const onSubmit = ({ email }) => {
    console.log(email);
    setUserEmail(email);
  };
  const { isSubmitting, errors, isDirty } = formState;

  return (
    <Fragment>
      <h3 className="is-size-5 mt-2 has-text-weight-medium">Email Address</h3>
      <form
        className="is-flex is-flex-direction-row is-flex-wrap-wrap is-align-items-flex-start"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="mr-3 my-3">
          <Input
            className="rounded-lg border-light flex-1 p-3"
            placeholder="Enter Email Address"
            register={register}
            name="email"
            disabled={isSubmitting}
            classNames="rounded-lg border-light flex-1 p-3"
            style={{ height: 41, width: 246 }}
            error={errors?.email}
          />
        </div>
        <button
          className={`button rounded-lg has-background-black has-text-white my-3 ${
            isDirty ? '' : 'is-disabled'
          }`}
          disabled={!isDirty}
          onClick={handleSubmit(onSubmit)}
          type="submit"
        >
          Save
        </button>
      </form>
    </Fragment>
  );
}
