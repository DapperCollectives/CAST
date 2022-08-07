import * as yup from 'yup';

yup.addMethod(yup.array, 'unique', function (field, message) {
  return this.test('unique', message, function (array = []) {
    const uniqueData = Array.from(
      new Set(array.map((row) => row[field]?.toLowerCase()))
    );
    const isUnique = array.length === uniqueData.length;
    if (isUnique) {
      return true;
    }
    const index = array.findIndex(
      (row, i) => row[field]?.toLowerCase() !== uniqueData[i]
    );
    if (array[index][field] === '') {
      return true;
    }
    return this.createError({
      path: `${this.path}.${index}.${field}`,
      message,
    });
  });
});

yup.addMethod(yup.array, 'allowOneEmptyElement', function (field, message) {
  return this.test('allowOneEmptyElement', message, function (array = []) {
    return array.length === 1 && array[0][field] === '';
  });
});

const AddressSchema = ({ isValidFlowAddress, isEditMode = false } = {}) => {
  const addresValidation = (yupSchema) =>
    yupSchema
      .matches(/0[x,X][a-zA-Z0-9]{16}$/gim, {
        message: 'Invalid Address format',
        excludeEmptyString: !isEditMode,
      })
      .test(
        'checkValidAddressOnChain',
        'This Address does not exist on chain',
        async (value, context) => {
          if (isValidFlowAddress && value !== '') {
            let addrVal;
            try {
              addrVal = await isValidFlowAddress(value);
            } catch (error) {
              // This is to bypass error on local
              // emulator when keys field is not present
              // on flow emulator response
              if (
                process.env.REACT_APP_APP_ENV?.toUpperCase() === 'PRODUCTION'
              ) {
                return false;
              } else if (
                !error?.message.includes(
                  "Cannot read properties of undefined (reading 'map')"
                )
              ) {
                return false;
              }
            }
            return !!addrVal;
          }
          return true;
        }
      );

  const basicValidation = yup.object().shape({
    addrList: yup
      .array(
        yup.object({
          addr: isEditMode
            ? addresValidation(
                yup.string().required('Please enter a Flow Address')
              )
            : addresValidation(yup.string()),
        })
      )
      .min(1)
      .unique('addr', 'Invalid duplicated address'),
  });

  if (isEditMode) {
    return basicValidation;
  }
  return basicValidation.allowOneEmptyElement('addr', 'Invalid empty Address');
};
export { AddressSchema };
