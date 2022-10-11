import { createContext, useContext, useState } from 'react';

const NotificationServiceContext = createContext({});

export const useNotificationServiceContext = () => {
  const context = useContext(NotificationServiceContext);
  if (context === undefined) {
    throw new Error(
      '`useNotificationServiceContext` must be used within a `NotificationServiceProvider`.'
    );
  }
  return context;
};

const NotificationServiceProvider = ({ children }) => {
  const [notificationSettings, setNotificationSettings] = useState({
    walletId: '',
    email: '',
    communitySubscription: [],
    isUnsubscribedFromCommunityUpdates: false,
  });
  return (
    <NotificationServiceContext.Provider
      value={{ notificationSettings, setNotificationSettings }}
    >
      {children}
    </NotificationServiceContext.Provider>
  );
};

export default NotificationServiceProvider;
