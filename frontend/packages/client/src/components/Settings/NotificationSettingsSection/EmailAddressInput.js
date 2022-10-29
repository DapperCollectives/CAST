import { Fragment } from 'react';
import { useForm } from 'react-hook-form';
import Input from 'components/common/Input';
import { EMAIL_REGEX } from 'const';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

export default function EmailAddressInput({ defaultEmail, setUserEmail }) {
  const { register, handleSubmit, formState, setValue } = useForm({
    defaultValues: {
      email: defaultEmail,
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
  const onSubmit = async ({ email }) => {
    try {
      await setUserEmail(email);
    } catch (e) {
      setValue('email', defaultEmail);
    }
  };
  const { isSubmitting, errors, isDirty } = formState;

  return (
    <Fragment>
      <h3 className="is-size-6 mt-2 has-text-weight-medium">Email Address</h3>
      <form
        className="is-flex is-flex-direction-row is-flex-wrap-wrap is-align-items-flex-start"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="mr-3 my-5">
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
          className={`button rounded-lg has-background-black has-text-white my-5 ${
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
