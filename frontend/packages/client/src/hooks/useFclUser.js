import { useState, useEffect } from "react";

export default function useFclUser(provider) {
  const [user, setUser] = useState({});

  useEffect(
    () => provider.currentUser().subscribe((user) => setUser({ ...user })),
    [provider]
  );

  return user;
}
