import yup from 'helpers/validation';

const formFields = ['title', 'strategy', 'body', 'choices'];

const Schema = yup.object().shape({
  title: yup
    .string()
    .trim()
    .required('Please enter a proposal title')
    .max(150, 'The maximum length for title is 128 characters'),
  strategy: yup.string().required('Please select a strategy'),
  body: yup.string().required('Please enter a proposal description'),
  choices: yup
    .array(
      yup.object({
        value: yup.string().required('Please enter option value'),
        choiceImgUrl: yup.string(),
      })
    )
    .min(2, 'Please add an option, minimun amout of options is two')
    .unique('value', 'Invalid duplicated option'),
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
