import { createContext, useContext, useEffect, useState } from 'react';
import { useWebContext } from './Web3';

const NotificationServiceContext = createContext({});

const INIT_NOTIFICATION_SETTINGS = {
  walletId: '',
  email: '',
  communitySubscription: [],
  isUnsubscribedFromCommunityUpdates: false,
};

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
  const [notificationSettings, setNotificationSettings] = useState(
    INIT_NOTIFICATION_SETTINGS
  );

  const {
    user: { addr },
  } = useWebContext();

  useEffect(() => {
    if (addr) {
      setUserID(addr);
    } else {
      setNotificationSettings(INIT_NOTIFICATION_SETTINGS);
    }
  }, [addr]);

  const setUserID = async (walletId) => {
    try {
      //here we call api to init the leanplum sdk
      setNotificationSettings((prevState) => ({
        ...prevState,
        walletId,
      }));
    } catch {
      throw new Error('cannot set user id for leanplum');
    }
  };

  const setUserEmail = async (email) => {
    try {
      //here we call api
      setNotificationSettings((prevState) => ({
        ...prevState,
        email,
      }));
    } catch {
      throw new Error('cannot set user email');
    }
  };

  const getUserSettings = async () => {
    try {
      //here we call api
      setNotificationSettings((prevState) => ({
        ...prevState,
        communitySubscription: [{ communityId: 1, subscribed: true }],
        isUnsubscribedFromCommunityUpdates: false,
      }));
    } catch {
      throw new Error('cannot get user settings');
    }
  };

  const unsubscribeCommunity = async (communityId) => {
    try {
      //here we call api
      setNotificationSettings((prevState) => ({
        ...prevState,
        communitySubscription: {
          ...prevState.communitySubscription,
          [communityId]: false,
        },
      }));
    } catch {
      throw new Error('cannot unsubscribe community');
    }
  };

  const subscribeCommunity = async (communityId) => {
    try {
      //here we call api
      setNotificationSettings((prevState) => ({
        ...prevState,
        communitySubscription: {
          ...prevState.communitySubscription,
          [communityId]: true,
        },
      }));
    } catch {
      throw new Error('cannot subscribe community');
    }
  };

  const unsubscribeFromEmailNotifications = async () => {
    try {
      //here we call api
      setNotificationSettings((prevState) => ({
        ...prevState,
        isUnsubscribedFromCommunityUpdates: true,
      }));
    } catch {
      throw new Error('cannot unscribe from email notifications');
    }
  };

  const resubscribeFromEmailNotifications = async () => {
    try {
      //here we call api
      setNotificationSettings((prevState) => ({
        ...prevState,
        isUnsubscribedFromCommunityUpdates: false,
      }));
    } catch {
      throw new Error('cannot resubscribe from email notifications');
    }
  };
  const providerProps = {
    notificationSettings,
    setUserID,
    setUserEmail,
    getUserSettings,
    unsubscribeCommunity,
    subscribeCommunity,
    unsubscribeFromEmailNotifications,
    resubscribeFromEmailNotifications,
  };
  return (
    <NotificationServiceContext.Provider value={providerProps}>
      {children}
    </NotificationServiceContext.Provider>
  );
};

export default NotificationServiceProvider;
