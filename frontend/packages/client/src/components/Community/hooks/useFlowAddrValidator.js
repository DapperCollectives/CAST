import { useState, useEffect } from "react";

const uniqueElements = (adminList) => {
  const setList = new Set([
    ...adminList.map((e) => e.addr.toLocaleLowerCase()),
  ]);
  return adminList.length === setList.size;
};

const hasValidAddresses = (list) => {
  return list.every((el) => /0[x,X][a-zA-Z0-9]{16}$/gim.test(el.addr));
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

export default function useFlowAddrValidator({ addrList, initialList }) {
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const baseValidation =
      addrList.length > 0 &&
      uniqueElements(addrList) &&
      notEmptyAddr(addrList) &&
      hasValidAddresses(addrList);

    if (
      initialList &&
      listHasChanged(
        addrList,
        initialList.map((e) => e.addr)
      ) &&
      baseValidation
    ) {
      setIsValid(true);
    } else if (baseValidation) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  }, [addrList, setIsValid, initialList]);

  return { isValid };
}
