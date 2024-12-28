import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { ActivityIndicator, SafeAreaView } from 'react-native';

// get user login detail
const getUserDetail = async () => {
  try {
    const value = await AsyncStorage.getItem('userDetail');
    // check if first install
    const firstInstall = await AsyncStorage.getItem('firstInstall');

    if (value !== null) {
      return {
        status: true,
        data: JSON.parse(value),
        error: false,
        firstInstall: firstInstall,
      };
    } else {
      return {
        status: false,
        error: false,
        data: null,
        firstInstall: firstInstall,
      };
    }
  } catch (error) {
    return {
      status: false,
      data: null,
      error: error,
    };
  }
};
// store user login detail

const storeUserDetail = async value => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem('userDetail', jsonValue);
    return {
      status: true,
      data: value,
      error: false,
      firstInstall: true,
    };
  } catch (e) {
    return {
      error: e,
      status: false,
      data: null,
    };
  }
};
const storeRulletCountToday = async value => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem('RulletCountToday', jsonValue);
    return {
      status: true,
      data: value,
    };
  } catch (e) {
    return {
      error: e,
      status: false,
      data: null,
    };
  }
};

const getRulletCountToday = async () => {
  try {
    const value = await AsyncStorage.getItem('RulletCountToday');

    return {
      status: false,
      data: JSON.parse(value),
    };

  } catch (error) {
    return {
      status: true,
      data: null,
    };
  }
};
// add first install status
const addFirstInstallStatus = async () => {
  try {
    await AsyncStorage.setItem('firstInstall', 'true');
    return true;
  } catch (e) {
    return e;
  }
};

// logout user
const logoutUser = async () => {
  try {
    await AsyncStorage.removeItem('userDetail');
    return true;
  } catch (e) {
    return e;
  }
};

// remove first install status
const removeFirstInstallStatus = async () => {
  try {
    await AsyncStorage.removeItem('firstInstall');
    return true;
  } catch (e) {
    return e;
  }
};

export {
  getUserDetail,
  storeUserDetail,
  addFirstInstallStatus,
  removeFirstInstallStatus,
  logoutUser,
  storeRulletCountToday,
  getRulletCountToday,
};
