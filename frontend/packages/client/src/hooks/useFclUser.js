import { useState, useEffect } from "react";

export default function useFclUser(provider, forceLedger) {
  const [user, setUser] = useState({});
  const [isLedger, setIsLedger] = useState(false);

  useEffect(() => {
    provider.currentUser().subscribe((user) => {
      setUser({ ...user });
      if (forceLedger) {
        setIsLedger(true);
      } else if (user?.services) {
        setIsLedger(user.services[0]?.uid === "fcl-ledger-authz");
      }
    });
  }, [provider, forceLedger]);

  return {
    user,
    isLedger,
  };
}
