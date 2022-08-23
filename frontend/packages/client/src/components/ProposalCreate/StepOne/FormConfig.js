import yup from 'helpers/validation';

const formFields = ['title', 'strategy', 'body', 'choices', 'tabOption'];

const Schema = yup.object().shape({
  title: yup
    .string()
    .trim()
    .required('Please enter a proposal title')
    .max(150, 'The maximum length for title is 128 characters'),
  strategy: yup.string().required('Please select a strategy'),
  body: yup.string().required('Please enter a proposal description'),
  tabOption: yup.string().oneOf(['text-based', 'visual']),
  choices: yup
    .array(
      yup
        .object({
          value: yup.string().required('Please enter option value'),
          choiceImgUrl: yup.string().nullable(),
        })
        .when('tabOption', {
          is: (option) => option === 'visual',
          then: yup.object({
            value: yup.string().required('Please enter option value'),
            choiceImgUrl: yup
              .string()
              .url()
              .required('Image option is not valid'),
          }),
        })
    )
    .min(2, 'Please add a choice, minimun amout is two')
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
