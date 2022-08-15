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

export { addresValidation };
