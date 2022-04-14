import { useState, useEffect } from "react";

export default function useFclUser(provider) {
  const [user, setUser] = useState({});
  const [isLedger, setIsLedger] = useState(false);

  useEffect(
    () => {
      provider.currentUser().subscribe((user) => {
        setUser({ ...user });
        if (user?.services) {
          setIsLedger(user.services[0]?.uid === "fcl-ledger-authz")
        }
      });
    },
    [provider]
  );

  return {
    user,
    isLedger
  }
}
