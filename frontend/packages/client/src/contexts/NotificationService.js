import { createContext, useContext, useEffect, useState } from 'react';
import { useWebContext } from './Web3';

const NotificationServiceContext = createContext({});

const INIT_NOTIFICATION_SETTINGS = {
  walletId: '',
  email: '',
  communitySubscription: [{ communityId: '1', subscribed: true }],
  isSubscribedFromCommunityUpdates: false,
};

const updateCommunitySubscription = (
  communitySubscription,
  communityId,
  subscribed
) => {
  const newCommunitySubscription = [...communitySubscription];
  const updateIndex = newCommunitySubscription.findIndex(
    (communitySub) => communitySub.communityId === communityId
  );
  newCommunitySubscription[updateIndex].subscribed = subscribed;
  return newCommunitySubscription;
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
      const userSettings = INIT_NOTIFICATION_SETTINGS;
      setNotificationSettings(userSettings);
    } catch {
      throw new Error('cannot get user settings');
    }
  };

  const unsubscribeCommunity = async (communityId) => {
    try {
      //here we call api
      setNotificationSettings((prevState) => {
        const newCommunitySubscription = updateCommunitySubscription(
          prevState.communitySubscription,
          communityId,
          false
        );
        return {
          ...prevState,
          communitySubscription: newCommunitySubscription,
        };
      });
    } catch {
      throw new Error('cannot unsubscribe community');
    }
  };

  const subscribeCommunity = async (communityId) => {
    try {
      //here we call api
      setNotificationSettings((prevState) => {
        const newCommunitySubscription = updateCommunitySubscription(
          prevState.communitySubscription,
          communityId,
          true
        );
        return {
          ...prevState,
          communitySubscription: newCommunitySubscription,
        };
      });
    } catch {
      throw new Error('cannot subscribe community');
    }
  };

  const unsubscribeFromEmailNotifications = async () => {
    try {
      //here we call api
      setNotificationSettings((prevState) => ({
        ...prevState,
        isSubscribedFromCommunityUpdates: false,
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
        isSubscribedFromCommunityUpdates: true,
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
