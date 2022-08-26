import yup from 'helpers/validation';

const formFieldsStepOne = ['title', 'strategy', 'body', 'choices', 'tabOption'];
const formFieldsStepTwo = [];

const StepOneSchema = yup.object().shape({
  title: yup
    .string()
    .trim()
    .required('Please enter a proposal title')
    .max(150, 'The maximum length for title is 128 characters'),
  strategy: yup.string().required('Please select a strategy'),
  body: yup.string().required('Please enter a proposal description'),
  tabOption: yup.string().oneOf(['text-based', 'visual']),
  choices: yup
    .array()
    .of(
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

const StepTwoSchema = yup.object().shape({
  startDate: yup.date().required('Please provide a start date'),
  startTime: yup.date().required('Please provide a start time'),
  endDate: yup.date().required('Please provide a end date'),
  endTime: yup.date().required('Please provide a end time'),
});

const initialValues = (fields = []) =>
  Object.assign({}, ...fields.map((key) => ({ [key]: '' })));

const stepOne = {
  Schema: StepOneSchema,
  initialValues: initialValues(formFieldsStepOne),
  formFields: formFieldsStepOne,
};

const stepTwo = {
  Schema: StepTwoSchema,
  initialValues: initialValues(formFieldsStepTwo),
  formFields: formFieldsStepTwo,
};

export { stepOne, stepTwo };
