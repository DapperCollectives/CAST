import * as yup from 'yup';

const formFields = ['title', 'strategy', 'body'];

const Schema = yup.object().shape({
  title: yup
    .string()
    .trim()
    .required('Please enter a proposal title')
    .max(150, 'The maximum length for title is 128 characters'),
  strategy: yup.string().required('Please select a strategy'),
  body: yup.string().required('Please enter a proposal description'),
});

const initialValues = Object.assign(
  {},
  ...formFields.map((key) => ({ [key]: '' }))
);
const stepOne = {
  Schema,
  initialValues,
  formFields,
};

export { stepOne };
