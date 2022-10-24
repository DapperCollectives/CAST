import { createContext, useContext, useEffect, useState } from 'react';
import {
  LEANPLUM_APP_ID,
  LEANPLUM_DEV_KEY,
  LEANPLUM_PROD_KEY,
} from 'api/constants';
import Leanplum from 'leanplum-sdk';
import { subscribeNotificationIntentions } from 'const';
import { useWebContext } from './Web3';

const NotificationServiceContext = createContext({});

const INIT_NOTIFICATION_SETTINGS = {
  walletId: '',
  email: '',
  communitySubscription: [{ communityId: '1', subscribed: true }],
  isSubscribedFromCommunityUpdates: true,
};

const updateCommunitySubscriptionState = (
  communitySubscription,
  communityId,
  subscribedValue
) => {
  const newCommunitySubscription = [...communitySubscription];
  const updateIndex = newCommunitySubscription.findIndex(
    (communitySub) => communitySub.communityId === communityId
  );
  if (updateIndex === -1) {
    newCommunitySubscription.push({ communityId, subscribed: subscribedValue });
  } else {
    newCommunitySubscription[updateIndex].subscribed = subscribedValue;
  }
  return newCommunitySubscription;
};

const IS_LOCAL_DEV = process.env.REACT_APP_APP_ENV === 'development';

if (IS_LOCAL_DEV) {
  Leanplum.setAppIdForDevelopmentMode(LEANPLUM_APP_ID, LEANPLUM_DEV_KEY);
} else {
  Leanplum.setAppIdForProductionMode(LEANPLUM_APP_ID, LEANPLUM_PROD_KEY);
}

Leanplum.start();

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
      (async () => {
        await setUserID(addr);
        getUserSettings();
      })();
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
      const { communitySubscription, isSubscribedFromCommunityUpdates } =
        INIT_NOTIFICATION_SETTINGS;
      setNotificationSettings((prevState) => ({
        ...prevState,
        communitySubscription,
        isSubscribedFromCommunityUpdates,
      }));
    } catch {
      throw new Error('cannot get user settings');
    }
  };

  const updateCommunitySubscription = async (
    communityId,
    subscribeIntention
  ) => {
    try {
      if (subscribeIntention === subscribeNotificationIntentions.subscribe) {
        //call api to subscribe community
      } else if (
        subscribeIntention === subscribeNotificationIntentions.unsubscribe
      ) {
        //call api to unsubscribe community
      }
      setNotificationSettings((prevState) => {
        const newCommunitySubscription = updateCommunitySubscriptionState(
          prevState.communitySubscription,
          communityId,
          subscribeIntention === subscribeNotificationIntentions.subscribe
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

  const updateAllEmailNotificationSubscription = async (subscribeIntention) => {
    if (subscribeIntention === subscribeNotificationIntentions.resubscribe) {
      //call api to resubscribe all email notifications
    } else if (
      subscribeIntention === subscribeNotificationIntentions.unsubscribe
    ) {
      //call api to unsubscribe all email notifications
    }
    setNotificationSettings((prevState) => ({
      ...prevState,
      isSubscribedFromCommunityUpdates:
        subscribeIntention === subscribeNotificationIntentions.resubscribe,
    }));
  };

  const providerProps = {
    notificationSettings,
    setUserID,
    setUserEmail,
    getUserSettings,
    updateCommunitySubscription,
    updateAllEmailNotificationSubscription,
  };
  return (
    <NotificationServiceContext.Provider value={providerProps}>
      {children}
    </NotificationServiceContext.Provider>
  );
};

export default NotificationServiceProvider;
