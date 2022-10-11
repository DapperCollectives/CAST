import yup from 'helpers/validation';

const formFieldsStepOne = ['name', 'strategy', 'body', 'choices', 'tabOption'];
const formFieldsStepTwo = ['startDate', 'endDate', 'startTime', 'endTime'];

const StepOneSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required('Please enter a proposal title')
    .max(128, 'The maximum length for title is 128 characters'),
  strategy: yup.string().required('Please select a strategy'),
  body: yup.string().required('Please enter a proposal description'),
  tabOption: yup.string().oneOf(['text-based', 'visual']),
  choices: yup
    .array()
    .of(
      yup.object({
        value: yup.string().required('Please enter option value'),
        choiceImgUrl: yup.string().nullable(),
      })
    )
    .when('tabOption', {
      is: 'visual',
      then: yup.array().of(
        yup.object({
          value: yup.string().required('Please enter option value'),
          choiceImgUrl: yup
            .string()
            .trim()
            .url('Image option is not valid')
            .required('Please upload an image'),
        })
      ),
    })
    .min(2, 'Please add a choice, minimum amout is two')
    .unique('value', 'Invalid duplicated option'),
  maxWeight: yup
    .string()
    .trim()
    .matches(
      /\s+$|^$|(^[0-9]+$)/,
      'Proposal maximun weight must be a valid number'
    ),
  minBalance: yup
    .string()
    .trim()
    .matches(
      /\s+$|^$|(^[0-9]+$)/,
      'Proposal minimum balance must be a valid number'
    ),
});

const StepTwoSchema = yup.object().shape({
  startDate: yup.date().required('Please provide a start date'),
  startTime: yup.date().required('Please provide a start time'),
  endDate: yup.date().required('Please provide an end date'),
  endTime: yup.date().required('Please provide an end time'),
});

const initialValues = (fields = []) =>
  Object.assign({}, ...fields.map((key) => ({ [key]: undefined })));

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
