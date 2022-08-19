import * as yup from 'yup';

const initialValues = {
  title: '',
};
const Schema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required('Please enter a proposal title')
    .max(150, 'The maximum length for title is 128 characters'),
});

const stepOne = {
  Schema,
  initialValues,
};

export { stepOne };
