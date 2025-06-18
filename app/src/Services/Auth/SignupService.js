import { base_url, node_base_url } from '../../consts/baseUrls';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';

// get token 
const getToken = async () => {
  try {
    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    return token;
  } catch (error) {
    console.error('Failed to get FCM token:', error);
  }
};

const registerByEmail = async data => {
  var InsertAPIURL = node_base_url + '/user/v1/usersignup';
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  const token = await getToken();
  var body = {
    email: data.email,
    password: data.password,
    device_id: token, // device_id is required for the notifications
    role: 'user',
    type: data.type,
    addUserToWaitingList: data.addUserToWaitingList
  };
  console.log('registerByEmail body:', body);
  try {
    const response = await fetch(InsertAPIURL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the calling function
  }
};
const checkUserExists = async data => {
  var InsertAPIURL = node_base_url + '/user/v1/checkUserExists';
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  var body = {
    email: data.email,
  };
  try {
    const response = await fetch(InsertAPIURL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the calling function
  }
};
const loginsByEmail = async data => {
  var InsertAPIURL = node_base_url + '/user/v1/usersignin';
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  console.log('siging in');
  const token = await getToken();
  var body = {
    email: data.email,
    password: data.password,
    device_id: token, // device_id is required for the notifications
    role: 'user',
  };
  try {
    const response = await fetch(InsertAPIURL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the calling function
  }
};
const BasicProfileInfoService = async data => {
  var InsertAPIURL = base_url + '/user/BasicProfileInfo.php';

  try {
    const body = {
      email: data.email,
      age: data.age,
      full_name: data.full_name,
      gender: data.gender,
    };

    const response = await fetch(InsertAPIURL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the calling function
  }
};
const updateUserProfileData = async (data, id) => {
  var InsertAPIURL = node_base_url + '/user/v1/updateProfile/' + id;
  var body = {
    name: data?.data?.full_name || data?.name,
    age: data?.data?.age || data?.age,
    gender: data?.data?.gender?.toUpperCase() || data?.gender?.toUpperCase(),
    images: data?.data?.images || data?.images,
    profile_image: data?.data?.profile_picture || data?.profile_image,
    note: data?.data?.note || data?.note || '',
  };
  try {
    const response = await fetch(InsertAPIURL, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the calling function
  }
};
const getMatchUsers = async data => {
  let user_id = data.user_id;
  let prefered_gender = data.prefered_gender.toUpperCase();
  // let current_user_gender = data.current_user_gender == 'FEMALE' ? 'MALE' : 'FEMALE'

  // AsyncStorage.setItem('signup_user', true);
  const val = await AsyncStorage.getItem('signup_user');
  const signup_user = JSON.parse(val);


  if (signup_user?.signup_user == true) {
    var InsertAPIURL = node_base_url + '/user/v1/newMatchAlgo2?preferred_gender=' + prefered_gender + '&new_user_id=' + user_id;
    // node_base_url + '/user/v1/newMatchAlgo?current_user_gender=' + current_user_gender + '&current_user_id=' + user_id;
  }

  else {
    var InsertAPIURL = node_base_url + '/user/v1/newMatchAlgo2?preferred_gender=' + prefered_gender + '&new_user_id=' + user_id;
    // var InsertAPIURL = node_base_url + '/user/v1/newMatchAlgo?current_user_id=' + user_id;
  }

  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(InsertAPIURL, {
      method: 'GET',
      headers: headers,
    });
    const jsonResponse = await response.json();
    // console.log('jsonResponse', jsonResponse);
    AsyncStorage.setItem('signup_user',
      JSON.stringify({
        signup_user: false,
      }),
    );
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the calling function
  }
};
const getUserJokerCard = async data => {
  let user_id = data.user_id;
  let prefered_gender = data.prefered_gender;
  let isSystemAssigned = data.isSystemAssigned;

  var InsertAPIURL = node_base_url + '/user/v1/getJokerCards?preferred_gender=' + prefered_gender + '&new_user_id=' + user_id + '&isSystemAssigned=' + isSystemAssigned;
  console.log('InsertAPIURL', InsertAPIURL);
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(InsertAPIURL, {
      method: 'GET',
      headers: headers,
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the calling function
  }
};
const assignJokerToUser = async data => {

  let from_user_id = data.from_user_id;
  let to_user_id = data.to_user_id;
  let jokercard = data.jokercard;
  let isSystemAssigned = data.isSystemAssigned;


  var InsertAPIURL = node_base_url + '/user/v1/assignJokerToUser';
  console.log('InsertAPIURL', InsertAPIURL);
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(InsertAPIURL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        from_user_id: from_user_id,
        to_user_id: to_user_id,
        jokercard: jokercard,
        isSystemAssigned: isSystemAssigned
      }),
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the calling function
  }
};
const getMatchUsersForChat = async data => {
  let user_id = data.user_id;
  let current_user_gender = data.current_user_gender;

  // AsyncStorage.setItem('signup_user', true);
  const val = await AsyncStorage.getItem('signup_user');
  const signup_user = JSON.parse(val);
  // console.log('signup_user', signup_user.signup_user);

  var InsertAPIURL =
    node_base_url + '/user/v1/getLogMatchUsersForChat?current_user_id=' + user_id;


  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(InsertAPIURL, {
      method: 'GET',
      headers: headers,
    });
    const jsonResponse = await response.json();
    console.log('jsonResponse', jsonResponse);
    AsyncStorage.setItem('signup_user',
      JSON.stringify({
        signup_user: false,
      }),
    );
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the calling function
  }
};
const getAllQuestions = async data => {
  var InsertAPIURL = node_base_url + '/questions/v1/getAllQuestions?page=1&limit=10';
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  try {
    const response = await fetch(InsertAPIURL, {
      method: 'GET',
      headers: headers,
      // body: JSON.stringify(body),
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the calling function
  }
};
const addAnswertoQuestion = async data => {
  var InsertAPIURL = node_base_url + '/answers/v1/createanswer';
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  var body = {
    user_id: data.user_id,
    question_id: data.question_id,
    answer: data.answer,
  };
  try {
    const response = await fetch(InsertAPIURL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the calling function
  }
};
const addNote = async data => {
  var InsertAPIURL = node_base_url + '/user/v1/updateVoiceNotes';
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  var body = {
    user_id: data?.user_id,
    note: data?.note,
    bio_notes: data?.bio_notes,
  };
  try {
    const response = await fetch(InsertAPIURL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the calling function
  }
};
const getUsersforJokerCard = async (current_user_id) => {
  var InsertAPIURL = node_base_url + '/user/v1/getUsersforJokerCard?current_user_id=' + current_user_id;
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(InsertAPIURL, {
      method: 'GET',
      headers: headers,
      // body: JSON.stringify(body),
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the calling function
  }
};
const getUserById = async (id) => {
  var InsertAPIURL = node_base_url + '/user/v1/getuserbyID/' + id;
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(InsertAPIURL, {
      method: 'GET',
      headers: headers,
      // body: JSON.stringify(body),
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the calling function
  }
};

const answerTheCall = async data => {
  var InsertAPIURL = node_base_url + '/user/v1/answerTheCall';
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  var body = {
    chat_room_name: data.chat_room_name,
    call_type: data.call_type,
    start_time: new Date(),
  };
  try {
    const response = await fetch(InsertAPIURL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the calling function
  }
};
const endTheCall = async data => {
  var InsertAPIURL = node_base_url + '/user/v1/endTheCall';
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  var body = {
    chat_room_name: data.chat_room_name,
    call_type: data.call_type,
    end_time: new Date(),
  };
  try {
    const response = await fetch(InsertAPIURL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the calling function
  }
};
const disQualifyUser = async data => {
  var InsertAPIURL = node_base_url + '/user/v1/disQualifyUser';
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  var body = {
    user_id: data.user_id,
    disqualify_user_id: data.disqualify_user_id,
    reason: data.reason,
    type: data.type,
  };
  try {
    const response = await fetch(InsertAPIURL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the calling function
  }
};

const initateTheCall = async data => {
  var InsertAPIURL = node_base_url + '/initiate-call';
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  var body = {
    callerId: data.callerId,
    receiverId: data.receiverId,
    callType: data.callType,
  };
  try {
    const response = await fetch(InsertAPIURL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the calling function
  }
};
// findUserInWaitingPool
const findUserInWaitingPool = async data => {
  var InsertAPIURL = node_base_url + '/user/v1/findUserInWaitingPool?user_id=' + data.user_id;
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  // var body = {
  //   user_id: data.user_id,
  // };
  try {
    const response = await fetch(InsertAPIURL, {
      method: 'GET',
      headers: headers,
      // body: JSON.stringify(body),
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the calling function
  }
};
const initateRulletCall = async data => {
  var InsertAPIURL = node_base_url + '/initiate-rullet-call';
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  var body = {
    callerId: data.callerId,
    receiverId: data.receiverId,
    callType: data.callType,
  };
  try {
    const response = await fetch(InsertAPIURL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the calling function
  }
};
const declineVideoCall = async data => {
  var InsertAPIURL = node_base_url + '/declineVideo-call';
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  var body = {
    callerId: data.callerId,
    receiverId: data.receiverId,
    callType: 'DECLINEVIDEOCALL',
  };
  try {
    const response = await fetch(InsertAPIURL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the calling function
  }
};
const declineRulletCall = async data => {
  var InsertAPIURL = node_base_url + '/declineRullet-call';
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  var body = {
    callerId: data.callerId,
    receiverId: data.receiverId,
    callType: 'DECLINERULLETCALL',
  };
  try {
    const response = await fetch(InsertAPIURL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the calling function
  }
};


const removeUserFromFateRullet = async data => {
  var InsertAPIURL = node_base_url + '/user/v1/removeUserFromFateRullet?user_id=' + data.user_id;
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  // var body = {
  //   user_id: data.user_id,
  // };
  try {
    const response = await fetch(InsertAPIURL, {
      method: 'GET',
      headers: headers,
      // body: JSON.stringify(body),
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the calling function
  }
};

const updateUserProfilePerference = async (data) => {
  var InsertAPIURL = node_base_url + '/user/v1/updateProfilePerference/';
  var body = {
    user_id: data.user_id,
    prefered_min_age: data.prefered_min_age,
    prefered_max_age: data.prefered_max_age,
    prefered_gender: data.prefered_gender
  };

  try {
    const response = await fetch(InsertAPIURL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the calling function
  }
};

const updateUserSubscription = async data => {
  var InsertAPIURL = node_base_url + '/user/v1/updateUserSubscription';
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  var body = {
    user_id: data.user_id,
    subscription_type: data.subscription_type,
  };

  try {
    const response = await fetch(InsertAPIURL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the
  }
};
const reportUser = async data => {
  var InsertAPIURL = node_base_url + '/user/v1/reportUser';
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  var body = {
    reported_by_user_id: data.reported_by_user_id,
    reported_user_id: data.reported_user_id,
    reason: data.reason,
  };

  try {
    const response = await fetch(InsertAPIURL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the
  }
};

const blockUser = async data => {
  var InsertAPIURL = node_base_url + '/user/v1/reportUser';
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  var body = {
    reported_by_user_id: data?.blocked_by_user_id,
    reported_user_id: data?.blocked_user_id,
    reason: data?.reason || '',
  };

  try {
    const response = await fetch(InsertAPIURL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the
  }
};
const getUserInsights = async data => {
  var InsertAPIURL = node_base_url + '/user/v1/getUserInsights?user_id=' + data.user_id + '&date_type=' + data.date_type;
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(InsertAPIURL, {
      method: 'GET',
      headers: headers,
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the
  }
};
const getUserByID = async data => {
  var InsertAPIURL = node_base_url + '/user/v1/getuserbyID/' + data;
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(InsertAPIURL, {
      method: 'GET',
      headers: headers,
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the
  }
};
const fateRulletUserForCall = async data => {
  var InsertAPIURL = node_base_url + '/user/v1/fateRulletUserForCall?user_id=' + data.user_id;
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(InsertAPIURL, {
      method: 'GET',
      headers: headers,
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the
  }
};

const updateMatchByFateRullet = async data => {
  var InsertAPIURL = node_base_url + '/user/v1/updateMatchByFateRullet?currentUser=' + data?.currentUser + '&otherUser=' + data?.otherUser + '&NewMatch=' + data?.NewMatch;
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(InsertAPIURL, {
      method: 'GET',
      headers: headers,
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the
  }
};
const sendNewMatchReq = async data => {
  var InsertAPIURL = node_base_url + '/user/v1/sendNewMatchReq?currentUserId=' + data?.currentUserId + '&exsistingMatchId=' + data?.exsistingMatchId + '&newMatchId=' + data?.newMatchId;
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(InsertAPIURL, {
      method: 'GET',
      headers: headers,
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the
  }
};
const declineMatchReq = async data => {
  var InsertAPIURL = node_base_url + '/user/v1/declineMatchReq?currentUserId=' + data?.currentUserId + '&exsistingMatchId=' + data?.exsistingMatchId + '&newMatchId=' + data?.newMatchId;
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(InsertAPIURL, {
      method: 'GET',
      headers: headers,
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the
  }
};
const acceptMatchReq = async data => {
  var InsertAPIURL = node_base_url + '/user/v1/acceptMatchReq?currentUserId=' + data?.currentUserId + '&exsistingMatchId=' + data?.exsistingMatchId + '&newMatchId=' + data?.newMatchId;
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(InsertAPIURL, {
      method: 'GET',
      headers: headers,
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the
  }
};
const addUserInWaitingPool = async data => {
  var InsertAPIURL = node_base_url + '/user/v1/addUserInCallWaitingPool?user_id=' + data.user_id;
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(InsertAPIURL, {
      method: 'GET',
      headers: headers,
      // body: JSON.stringify({
      //   user_id: data.user_id,
      // }),
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the
  }
};
const updatePasswordNew = async data => {
  var InsertAPIURL = node_base_url + '/user/v1/updatePasswordNew';
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(InsertAPIURL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        user_id: data.user_id,
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,

      }),
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the
  }
};
const getAllTokens = async data => {
  var InsertAPIURL = node_base_url + '/user/v1/getAllTokens?user_id=' + data.user_id;
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(InsertAPIURL, {
      method: 'GET',
      headers: headers,
      // body: JSON.stringify({
      //   user_id: data.user_id,
      //   oldPassword: data.oldPassword,
      //   newPassword: data.newPassword,
      // }),
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the
  }
};
const addToken = async data => {
  var InsertAPIURL = node_base_url + '/user/v1/addToken?user_id=' + data.user_id + '&new_tokens=' + data.new_tokens;
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(InsertAPIURL, {
      method: 'GET',
      headers: headers,
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the
  }
};
const deleteToken = async data => {
  var InsertAPIURL = node_base_url + '/user/v1/deleteToken?user_id=' + data.user_id + '&new_tokens=' + data.new_tokens;
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(InsertAPIURL, {
      method: 'GET',
      headers: headers,
      // body: JSON.stringify({
      //   user_id: data.user_id,
      //   oldPassword: data.oldPassword,
      //   newPassword: data.newPassword,
      // }),
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the
  }
};
const verifyPhotos = async data => {
  var InsertAPIURL = node_base_url + '/user/v1/verifyPhotos?user_id=' + data.user_id;
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(InsertAPIURL, {
      method: 'GET',
      headers: headers,
      // body: JSON.stringify({
      //   user_id: data.user_id,
      //   oldPassword: data.oldPassword,
      //   newPassword: data.newPassword,
      // }),
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the
  }
};


const forgetPasswordNew = async data => {
  var InsertAPIURL = node_base_url + '/user/v1/forgetPasswordNew';
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  const token = await getToken();
  var body = {
    email: data.email,
  };
  try {
    const response = await fetch(InsertAPIURL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the calling function
  }
};

const updateResetPasswordNew = async data => {
  var InsertAPIURL = node_base_url + '/user/v1/updateResetPasswordNew';
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  var body = {
    email: data.email,
    password: data.password,
  };
  try {
    const response = await fetch(InsertAPIURL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the calling function
  }
};
const getFateRulletUsersMatchFromWaitingPool = async data => {
  var InsertAPIURL = node_base_url + '/getFateRulletUsersMatchFromWaitingPool?user_id=' + data.user_id;
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  // var body = {
  //   email: data.email,
  //   password: data.password,
  // };
  try {
    const response = await fetch(InsertAPIURL, {
      method: 'GET',
      headers: headers,
      // body: JSON.stringify(body),
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the calling function
  }
};
const addrulletLog = async data => {
  var InsertAPIURL = node_base_url + '/user/v1/addrulletLog';
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  var body = {
    chatroom_id: data?.chatroom_id,
    action_from: data?.action_from,
    action_response: data?.action_response,
    new_match_user_id: data?.new_match_user_id,
    with_swap_match_user_id: data?.with_swap_match_user_id,
  };
  try {
    const response = await fetch(InsertAPIURL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the calling function
  }
};
const matchdecisionAfterRullet = async data => {
  var InsertAPIURL = node_base_url + '/user/v1/matchdecisionAfterRullet';
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  var body = {
    currentUserResponse: data.currentUserResponse,
    otherUserResponse: data.otherUserResponse,
  };
  try {
    const response = await fetch(InsertAPIURL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the calling function
  }
};
const callConnectSpotify = async data => {
  var InsertAPIURL = node_base_url + '/user/v1/connectSpotify';
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  var body = {
    user_id: data?.user_id,
    spotify_data: data?.spotify_data,
  };
  try {
    const response = await fetch(InsertAPIURL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the calling function
  }
};
const callConnectInstagram = async data => {
  var InsertAPIURL = node_base_url + '/user/v1/connectInstagram';
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  var body = {
    user_id: data?.user_id,
    instagram_data: data?.instagram_data,
  };
  console.log('≤≤≤≤≤≤ body ≥≥≥≥≥≥', body);
  try {
    const response = await fetch(InsertAPIURL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the calling function
  }
};

const generateWaveFormImage = async data => {
  var InsertAPIURL = node_base_url + '/waveform';
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  var body = {
    cloudinaryUrl: data.cloudinaryUrl,
  };
  try {
    const response = await fetch(InsertAPIURL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the calling function
  }
};

const userLogout = async data => {
  var InsertAPIURL = node_base_url + '/user/v1/userLogout';
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  var body = {
    user_id: data.user_id,
  };
  try {
    const response = await fetch(InsertAPIURL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('This is the error:', error);
    throw error; // Throw the error to be caught by the calling function
  }
};

const deleteUserAccount = async data => {
  var InsertAPIURL = node_base_url + '/user/v1/deleteUserPermanently/' + data.user_id;
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(InsertAPIURL, {
      method: 'DELETE',
      headers: headers,
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('Error deleting user account:', error);
    throw error; // Throw the error to be caught by the calling function
  }
};
const sendFateRulletUserResponsetoOtherUser = async data => {
  var InsertAPIURL = node_base_url + '/getFateRulletUserResponseFromOtherUser';
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(InsertAPIURL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        accpeted_user_id: data?.accpeted_user_id,
        to_tell_user_id: data?.to_tell_user_id,
        // otherUserName: data?.otherUserName,
        // otherUserImage: data?.otherUserImage,

      })
    });

    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('Error ' + error);
    throw error; // Throw the error to be caught by the calling function
  }
};
const getResponse = async data => {
  var InsertAPIURL = node_base_url + '/user/v1/get-response';
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(InsertAPIURL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        email: data?.email
      })
    });

    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('Error ' + error);
    throw error; // Throw the error to be caught by the calling function
  }
};
const updateWaitingListStatus = async data => {
  var InsertAPIURL = node_base_url + '/user/v1/update-waitinglist-status';
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(InsertAPIURL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        user_id: data?.user_id,
        newStatus: data?.newStatus
      })
    });

    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('Error ' + error);
    throw error; // Throw the error to be caught by the calling function
  }
};

export {
  registerByEmail,
  BasicProfileInfoService,
  updateUserProfileData,
  getMatchUsers,
  getMatchUsersForChat,
  getAllQuestions,
  addAnswertoQuestion,
  getUsersforJokerCard,
  getUserById,
  answerTheCall,
  endTheCall,
  loginsByEmail,
  disQualifyUser,
  initateTheCall,
  updateUserProfilePerference,
  declineVideoCall, addNote,
  updateUserSubscription,
  getUserJokerCard,
  assignJokerToUser,
  getUserInsights,
  fateRulletUserForCall,
  initateRulletCall,
  declineRulletCall,
  updateMatchByFateRullet,
  findUserInWaitingPool,
  sendNewMatchReq,
  declineMatchReq,
  acceptMatchReq,
  addUserInWaitingPool,
  removeUserFromFateRullet,
  updatePasswordNew,
  getAllTokens,
  addToken,
  deleteToken,
  reportUser,
  blockUser,
  verifyPhotos,
  getUserByID,
  forgetPasswordNew,
  updateResetPasswordNew,
  getFateRulletUsersMatchFromWaitingPool,
  addrulletLog,
  matchdecisionAfterRullet,
  generateWaveFormImage,
  checkUserExists,
  callConnectSpotify,
  callConnectInstagram,
  userLogout,
  deleteUserAccount,
  sendFateRulletUserResponsetoOtherUser,
  getResponse,
  updateWaitingListStatus
};
