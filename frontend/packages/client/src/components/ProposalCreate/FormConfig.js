import yup from 'helpers/validation';

const formFieldsStepOne = ['name', 'body'];
const formFieldsStepTwo = ['strategy', 'choices', 'tabOption', 'voteType'];
const formFieldsStepThree = ['startDate', 'endDate', 'startTime', 'endTime'];

const NAME_MAX_LENGTH = 128;

const StepOneSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required('Please enter a proposal title')
    .max(NAME_MAX_LENGTH, 'The maximum length for title is 128 characters'),
  body: yup.string().required('Please enter a proposal description'),
});

const StepTwoSchema = yup.object().shape({
  strategy: yup.string().required('Please select a strategy'),
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
    .when('voteType', (voteType, schema) =>
      voteType === 'single-choice'
        ? schema.min(2, 'Please add a choice, minimum amount is two')
        : schema.min(3, 'Please add a choice, minimum amount is three')
    )
    .unique('value', 'Invalid duplicated option'),
  maxWeight: yup
    .string()
    .trim()
    .matches(
      /\s+$|^$|(^[0-9]+$)/,
      'Proposal maximum weight must be a valid number'
    ),
  minBalance: yup
    .string()
    .trim()
    .matches(
      /\s+$|^$|(^[0-9]+$)/,
      'Proposal minimum balance must be a valid number'
    ),
});

const StepThreeSchema = yup.object().shape({
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

const stepThree = {
  Schema: StepThreeSchema,
  initialValues: initialValues(formFieldsStepThree),
  formFields: formFieldsStepThree,
};

export { stepOne, stepTwo, stepThree, NAME_MAX_LENGTH };
