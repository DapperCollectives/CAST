import { addresValidation } from 'components/Community/CommunityEditorDetails';
import * as yup from 'yup';

yup.addMethod(yup.string, 'makeOtherFieldsRequired', function (message) {
  return this.test('checkOtherFields', message, function (value, context) {
    const { path, parent } = context;
    const otherProps = Object.keys(parent).filter(
      (key) => key !== path && key !== 'onlyAuthorsToSubmitProposals'
    );
    // if currrent field does not have data but other do throw error
    // to let the user know that it needs to be completed or field must be empty
    if (value === '' && otherProps.some((key) => parent[key] !== '')) {
      return this.createError({
        path: `${this.path}`,
        message,
      });
    }
    return true;
  });
});

const StepThreeSchema = (isValidFlowAddress) =>
  yup.object().shape({
    onlyAuthorsToSubmitProposals: yup.boolean(),
    contractAddress: yup
      .string()
      .makeOtherFieldsRequired(
        'Please enter a contract address if other fields are not empty'
      )
      .when('onlyAuthorsToSubmitProposals', {
        is: true,
        then: addresValidation(yup.string(), isValidFlowAddress, true),
        otherwise: addresValidation(yup.string(), isValidFlowAddress, false),
      }),
    contractName: yup
      .string()
      .makeOtherFieldsRequired(
        'Please enter a contract name if other fields are not empty'
      )
      .max(150, 'The maximum length for contract name is 150 characters')
      .when('onlyAuthorsToSubmitProposals', {
        is: false,
        then: yup.string().required('Please enter a contract name'),
      }),
    storagePath: yup
      .string()
      .makeOtherFieldsRequired(
        'Please enter a storage path if other fields are not empty'
      )
      .max(150, 'The maximum length for storage path is 150 characters')
      .when('onlyAuthorsToSubmitProposals', {
        is: false,
        then: yup.string().required('Please enter a storage path'),
      }),
    proposalThreshold: yup
      .string()
      .makeOtherFieldsRequired(
        'Please enter a proposal threshold if other fields are not empty'
      )
      .matches(/(^[0-9]+$|^$)/, 'Proposal threshold must be a number')
      .when('onlyAuthorsToSubmitProposals', {
        is: false,
        then: yup.string().required('Please enter a proposal threshold'),
      }),
  });

const stepThree = {
  Schema: StepThreeSchema,
};

export { stepThree };
