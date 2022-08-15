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
    if (array.length > 1 && array.some((e) => e[field] === '')) {
      const index = array.map((e) => e[field]).indexOf('');
      return this.createError({
        path: `${this.path}.${index}.${field}`,
        message,
      });
    }
    return true;
  });
});

const addEmptyElementValidation = (schema, isEditMode) => {
  if (!isEditMode) {
    // on create community flow this will enable one empty element
    return schema.allowOneEmptyElement('addr', 'Invalid empty Address');
  }
  return schema;
};

const addresValidation = (
  yupSchema,
  isValidFlowAddress,
  excludeEmptyString = true
) =>
  yupSchema
    .matches(/0[x,X][a-zA-Z0-9]{16}$/gim, {
      message: 'Invalid Address format',
      excludeEmptyString,
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
            if (process.env.REACT_APP_APP_ENV?.toUpperCase() === 'PRODUCTION') {
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

const AddressSchema = ({ isValidFlowAddress, isEditMode = false } = {}) => {
  const elementValidation = addEmptyElementValidation(
    yup
      .array(
        yup.object({
          addr: addresValidation(
            isEditMode
              ? yup.string().required('Please enter a Flow Address')
              : yup.string(),
            isValidFlowAddress,
            !isEditMode
          ),
        })
      )
      .min(1)
      .unique('addr', 'Invalid duplicated address'),
    isEditMode
  );
  return yup.object().shape({
    ...(isEditMode
      ? { addrList: elementValidation }
      : {
          listAddrAdmins: elementValidation,
          listAddrAuthors: elementValidation,
        }),
  });
};
export { AddressSchema, addresValidation };
