import {
  LEANPLUM_APP_ID,
  LEANPLUM_CRO_KEY,
  LEANPLUM_EXPORT_KEY,
  LEANPLUM_DEV_KEY,
  LEANPLUM_PROD_KEY,
} from 'api/constants';
import Leanplum from 'leanplum-sdk';

const COMMUNITY_UPDATES_CATEGORY_ID = 1;
const options = {
  method: 'GET',
  headers: { accept: 'application/json' },
};

export const startLeanplum = () => {
  const IS_LOCAL_DEV = process.env.REACT_APP_APP_ENV === 'development';

  if (IS_LOCAL_DEV) {
    Leanplum.setAppIdForDevelopmentMode(LEANPLUM_APP_ID, LEANPLUM_DEV_KEY);
  } else {
    Leanplum.setAppIdForProductionMode(LEANPLUM_APP_ID, LEANPLUM_PROD_KEY);
  }
  
  Leanplum.start();
}

export const setUserId = async (walletId) => {
  try {
    Leanplum.setUserId(walletId);
  } catch (e) {
    throw new Error(e);
  }
};

export const getUserSettings = async (walletId) => {
  try {
    let response = await fetch(
      `https://api.leanplum.com/api?appId=${LEANPLUM_APP_ID}&clientKey=${LEANPLUM_EXPORT_KEY}&apiVersion=1.0.6&userId=${walletId}&action=exportUser`,
      options
    )
    response = await response.json()
    const data = response.response[0]
    if (!data.success) {
      throw new Error(data.error.message);
    }
    if (!data.userAttributes) {
      throw new Error('User Not Found');
    }

    const communitySubscriptions = [];
    const res = {
      email: data.userAttributes.email,
    };
    let isSubscribedToCommunityUpdates = true;

    for (const property in data.userAttributes) {
      if (property.includes('community')) {
        const communityId = property.split('community')[1];
        communitySubscriptions.push({
          communityId,
          subscribed: data.userAttributes[property] === 'True',
        });
      }
    }

    res.communitySubscription = communitySubscriptions;

    if (data.unsubscribeCategories) {
      data.unsubscribeCategories.forEach((category) => {
        if (parseInt(category.id) === COMMUNITY_UPDATES_CATEGORY_ID) {
          isSubscribedToCommunityUpdates = false;
        }
      });
    }

    res.isSubscribedToCommunityUpdates = isSubscribedToCommunityUpdates;
    return res;
  } catch (e) {
    throw new Error(e)
  }
};

export const setUserEmail = async (email) => {
  try {
    await Leanplum.setUserAttributes({ email });
    return true
  } catch (e) {
    throw new Error(e);
  }
};

export const unsubscribeCommunity = async (communityId) => {
  try {
    Leanplum.setUserAttributes({ [`community${communityId}`]: 'False' });
    return true
  } catch (e) {
    throw new Error(e);
  }
};

export const subscribeCommunity = async (communityId) => {
  try {
    Leanplum.setUserAttributes({ [`community${communityId}`]: 'True' });
    return true
  } catch (e) {
    throw new Error(e);
  }
};

export const unsubscribeFromEmailNotifications = async (walletId) => {
  try {
    let response = await fetch(
      `https://www.leanplum.com/api?appId=${LEANPLUM_APP_ID}&clientKey=${LEANPLUM_CRO_KEY}&action=setUserAttributes&userId=${walletId}&unsubscribeCategoriesToAdd=${COMMUNITY_UPDATES_CATEGORY_ID}`,
      options
    )
    response = await response.json()  
    const data = response.response[0];
    if (!data.success) {
      throw new Error(data.error.message);
    }
    return data;
  } catch (e) {
    throw new Error(e);
  }
};

export const subscribeToEmailNotifications = async (walletId) => {
  try {
    let response = await fetch(
      `https://www.leanplum.com/api?appId=${LEANPLUM_APP_ID}&clientKey=${LEANPLUM_CRO_KEY}&action=setUserAttributes&userId=${walletId}&unsubscribeCategoriesToRemove=${COMMUNITY_UPDATES_CATEGORY_ID}`,
      options
    )
    response = await response.json()
    const data = response.response[0];
    if (!data.success) {
      throw new Error(data.error.message);
    }
    return data;
  } catch (e) {
    throw new Error(e);
  }
};
