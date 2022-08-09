import { useEffect, useState } from 'react';
import { isValidAddress } from 'utils';

const uniqueElements = (adminList) => {
  const setList = new Set([
    ...adminList.map((e) => e.addr.toLocaleLowerCase()),
  ]);
  return adminList.length === setList.size;
};

const hasValidAddresses = (list) => {
  return list.every((el) => isValidAddress(el.addr));
};
const listHasChanged = (adminList, admins) => {
  const setList = new Set([...adminList.map((e) => e.addr)]);

  if (admins.length !== setList.size) return true;

  for (let admin of admins) if (!setList.has(admin)) return true;

  return false;
};

const notEmptyAddr = (list) => {
  return list.every((e) => e.addr.trim().length > 0);
};

export default function useFlowAddrValidator({
  addrList,
  initialList = [],
} = {}) {
  const [validations, setValidations] = useState({
    isValid: false,
    hasChangedFromOriginal: false,
  });

  const { isValid, hasChangedFromOriginal } = validations;

  useEffect(() => {
    const baseValidation =
      addrList.length > 0 &&
      uniqueElements(addrList) &&
      notEmptyAddr(addrList) &&
      hasValidAddresses(addrList);

    const hasListChanged = listHasChanged(
      addrList,
      initialList.map((e) => e.addr)
    );
    if (
      isValid !== baseValidation ||
      hasChangedFromOriginal !== hasListChanged
    ) {
      setValidations({
        isValid: baseValidation,
        hasChangedFromOriginal: hasListChanged,
      });
    }
  }, [addrList, setValidations, initialList, isValid, hasChangedFromOriginal]);

  return validations;
}

export const validateAddrInList = (addrList, addr) => {
  // is valid Address
  if (!/0[x,X][a-zA-Z0-9]{16}$/gim.test(addr)) {
    return { isValid: false, error: 'Invalid Address.' };
  }
  if (addrList.filter((e) => e.addr === addr).length > 1) {
    return { isValid: false, error: 'Duplicated Address.' };
  }
  return { isValid: true, error: '' };
};
