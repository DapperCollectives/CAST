import { addresValidation } from 'components/Community/CommunityEditorDetails';
import * as yup from 'yup';

const getSchema = (formFields, isValidFlowAddress) => {
  const includeEvent = formFields.includes('floatEventId');
  return yup.object().shape({
    addr: addresValidation(yup.string(), isValidFlowAddress, false),
    name: yup
      .string()
      .max(150, 'The maximum length for contract name is 150 characters')
      .required('Please enter a contract name'),
    publicPath: yup
      .string()
      .max(150, 'The maximum length for storage path is 150 characters')
      .required('Please enter a storage path'),
    maxWeight: yup
      .string()
      .matches(/(^[0-9]+$)/, 'Proposal threshold must be a number'),
    threshold: yup
      .string()
      .matches(/(^[0-9]+$)/, 'Proposal threshold must be a number'),
    ...(includeEvent
      ? {
          floatEventId: yup
            .string()
            .matches(/(^[0-9]+$|^$)/, 'Proposal threshold must be a number'),
        }
      : undefined),
  });
};

export { getSchema };
