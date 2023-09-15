import { addressValidation } from 'components/Community/CommunityEditorDetails';
import omit from 'lodash/omit';
import values from 'lodash/values';
import * as yup from 'yup';

yup.addMethod(yup.string, 'makeOtherFieldsRequired', function (message) {
  return this.test('checkOtherFields', message, function (value, context) {
    const { path, parent } = context;
    const otherFieldsObj = omit(parent, [path, 'onlyAuthorsToSubmitProposals']);
    // if currrent field does not have data but other do throw error
    // to let the user know that it needs to be completed or field must be empty
    if (value === '' && values(otherFieldsObj).some((val) => val !== '')) {
      return this.createError({
        path: `${this.path}`,
        message,
      });
    }
    return true;
  });
});

yup.addMethod(yup.string, 'validateThreshold', function (message) {
  return this.test('checkLessThanOne', message, function (value, context) {
    const { path } = context;
    if (parseFloat(value) < 1) {
      return this.createError({
        path: `${path}`,
        message,
      });
    }
    return true;
  });
});

const Schema = (isValidFlowAddress) =>
  yup.object().shape({
    onlyAuthorsToSubmitProposals: yup.boolean(),
    contractAddress: yup
      .string()
      .makeOtherFieldsRequired(
        'Please enter a contract address if other fields are not empty'
      )
      .when('onlyAuthorsToSubmitProposals', {
        is: true,
        then: addressValidation(yup.string(), isValidFlowAddress, true),
        otherwise: addressValidation(
          yup.string().required('Please enter a contract address'),
          isValidFlowAddress,
          false
        ),
      }),
    contractName: yup
      .string()
      .trim()
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
      .trim()
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
      .trim()
      .makeOtherFieldsRequired(
        'Please enter a proposal threshold if other fields are not empty'
      )
      .matches(/(^[0-9]+$|^$)/, 'Proposal threshold must be a number')
      .validateThreshold('Threshold cannot be less than 1.')
      .when('onlyAuthorsToSubmitProposals', {
        is: false,
        then: yup.string().required('Please enter a proposal threshold'),
      }),
  });

export { Schema };
