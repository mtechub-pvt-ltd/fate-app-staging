import {base_url} from '../../consts/baseUrls';

const loginByEmail = async data => {
  var InsertAPIURL = base_url + '/user/login.php';
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
export {loginByEmail};
