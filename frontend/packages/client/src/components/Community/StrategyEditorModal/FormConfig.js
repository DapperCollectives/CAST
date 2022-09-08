import { addressValidation } from 'components/Community/CommunityEditorDetails';
import * as yup from 'yup';

const getSchema = (formFields, isValidFlowAddress) => {
  const includeEvent = formFields.includes('floatEventId');
  return yup.object().shape({
    addr: addressValidation(
      yup.string().required('Please enter a contract address'),
      isValidFlowAddress,
      false
    ),
    name: yup
      .string()
      .trim()
      .max(150, 'The maximum length for contract name is 150 characters')
      .required('Please enter a contract name'),
    publicPath: yup
      .string()
      .trim()
      .max(150, 'The maximum length for storage path is 150 characters')
      .required('Please enter a storage path'),
    maxWeight: yup
      .string()
      .trim()
      .required('Please enter a max weight number')
      .matches(/(^[0-9]+$)/, 'Proposal max weight must be a number'),
    threshold: yup
      .string()
      .trim()
      .required('Please enter a minimum balance number')
      .matches(/(^[0-9]+$)/, 'Proposal minimum balance be a number'),
    ...(includeEvent
      ? {
          floatEventId: yup
            .string()
            .trim()
            .matches(/(^[0-9]+$|^$)/, 'Proposal threshold must be a number'),
        }
      : undefined),
  });
};

const getCustomScriptSchema = () => {
  return yup.object().shape({
    maxWeight: yup
      .string()
      .trim()
      .required('Please enter a max weight number')
      .matches(/(^[0-9]+$)/, 'Proposal max weight must be a number'),
    threshold: yup
      .string()
      .trim()
      .required('Please enter a minimum balance number')
      .matches(/(^[0-9]+$)/, 'Proposal minimum balance be a number'),
  });
};

export { getSchema, getCustomScriptSchema };
