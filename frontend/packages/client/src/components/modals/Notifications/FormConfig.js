import * as yup from 'yup';

const EMAIL_REGEX =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/gim;

export const getSchema = () => {
  return yup.object().shape({
    email: yup
      .string()
      .trim()
      .matches(EMAIL_REGEX, 'Invalid email format')
      .required('Please enter an email address'),
  });
};
