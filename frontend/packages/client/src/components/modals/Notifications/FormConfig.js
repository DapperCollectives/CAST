import { EMAIL_REGEX } from 'const';
import * as yup from 'yup';

export const getSchema = () => {
  return yup.object().shape({
    email: yup
      .string()
      .trim()
      .matches(EMAIL_REGEX, 'Invalid email format')
      .required('Please enter an email address'),
  });
};
