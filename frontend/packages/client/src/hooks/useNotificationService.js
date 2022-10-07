import { useState } from 'react';

const GET_USER_SETTINGS_RESPONSE = {
  email: '',
  communitySubscription: [],
  isUnsubscribedFromCommunityUpdates: false,
};

export default function useNotificationService() {
  const [notificationSettings, setNotificationSettings] = useState({
    walletId: '',
    email: '',
    communitySubscription: [],
    isUnsubscribedFromCommunityUpdates: false,
  });

  const setUserID = async (walletId) => {
    try {
      //here we call api
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
      setNotificationSettings(GET_USER_SETTINGS_RESPONSE);
    } catch {
      throw new Error('cannot get user settings');
    }
  };

  const unsubscribeCommunityNotifications = async (communityId) => {
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
  return {
    notificationSettings,
    setUserID,
    setUserEmail,
    getUserSettings,
    unsubscribeCommunityNotifications,
    subscribeCommunity,
    unsubscribeFromEmailNotifications,
    resubscribeFromEmailNotifications,
  };
}
