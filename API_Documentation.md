# Fate Dating App - API Documentation

## Overview
This document provides comprehensive API documentation for the Fate Dating App, covering all HTTP REST APIs and real-time WebSocket communication endpoints. The documentation includes **65+ endpoints** across multiple categories.

## API Summary
- **HTTP REST APIs**: 58 endpoints
- **WebSocket/Socket.IO APIs**: 7 real-time communication events
- **Third-party Integrations**: Spotify, Instagram, Cloudinary
- **Core Features**: Authentication, Matching, Chat, Calls, Fate Roulette, Subscriptions

## Base URLs
- **Node.js Backend**: `https://backend.fatedating.com`
- **PHP Backend**: `https://backend.ofertasvapp.com/numee_testing/login/apis`
- **Cloudinary**: `https://api.cloudinary.com/v1_1/dfhk5givd`
- **File Upload**: `https://backend.fatedating.com/upload-file`
- **WebSocket**: `wss://backend.fatedating.com`

---

## Authentication APIs

### 1. User Signup
- **Endpoint**: `POST /user/v1/usersignup`
- **Base URL**: Node.js Backend
- **Description**: Register a new user account
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string",
    "device_id": "string (FCM Token)",
    "role": "user",
    "type": "string"
  }
  ```
- **Response**: JSON object with registration result

### 2. User Signin
- **Endpoint**: `POST /user/v1/usersignin`
- **Base URL**: Node.js Backend
- **Description**: Login existing user
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string",
    "device_id": "string (FCM Token)",
    "role": "user"
  }
  ```
- **Response**: JSON object with login result

### 3. Check User Exists
- **Endpoint**: `POST /user/v1/checkUserExists`
- **Base URL**: Node.js Backend
- **Description**: Check if user email already exists
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Request Body**:
  ```json
  {
    "email": "string"
  }
  ```
- **Response**: JSON object indicating if user exists

### 4. Legacy Login (PHP)
- **Endpoint**: `POST /user/login.php`
- **Base URL**: PHP Backend
- **Description**: Legacy login endpoint
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**: JSON object with login result

### 5. Forget Password
- **Endpoint**: `POST /user/v1/forgetPasswordNew`
- **Base URL**: Node.js Backend
- **Description**: Initiate password reset process
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Request Body**:
  ```json
  {
    "email": "string"
  }
  ```
- **Response**: JSON object with password reset result

### 6. Update Reset Password
- **Endpoint**: `POST /user/v1/updateResetPasswordNew`
- **Base URL**: Node.js Backend
- **Description**: Complete password reset with new password
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**: JSON object with update result

### 7. Update Password
- **Endpoint**: `POST /user/v1/updatePasswordNew`
- **Base URL**: Node.js Backend
- **Description**: Update user password
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Request Body**:
  ```json
  {
    "user_id": "string",
    "oldPassword": "string",
    "newPassword": "string"
  }
  ```
- **Response**: JSON object with update result

### 8. User Logout
- **Endpoint**: `POST /user/v1/userLogout`
- **Base URL**: Node.js Backend
- **Description**: Logout user from the system
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Request Body**:
  ```json
  {
    "user_id": "string"
  }
  ```
- **Response**: JSON object with logout result

---

## User Profile APIs

### 9. Basic Profile Info (Legacy)
- **Endpoint**: `POST /user/BasicProfileInfo.php`
- **Base URL**: PHP Backend
- **Description**: Update basic profile information
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Request Body**:
  ```json
  {
    "email": "string",
    "age": "number",
    "full_name": "string",
    "gender": "string"
  }
  ```
- **Response**: JSON object with profile update result

### 10. Update User Profile
- **Endpoint**: `PUT /user/v1/updateProfile/{id}`
- **Base URL**: Node.js Backend
- **Description**: Update comprehensive user profile data
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Request Body**:
  ```json
  {
    "name": "string",
    "age": "number",
    "gender": "string (UPPERCASE)",
    "images": "array",
    "profile_image": "string",
    "note": "string"
  }
  ```
- **Response**: JSON object with profile update result

### 11. Get User by ID
- **Endpoint**: `GET /user/v1/getuserbyID/{id}`
- **Base URL**: Node.js Backend
- **Description**: Retrieve user information by ID
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Response**: JSON object with user details

### 12. Update Profile Preferences
- **Endpoint**: `POST /user/v1/updateProfilePerference/`
- **Base URL**: Node.js Backend
- **Description**: Update user matching preferences
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Request Body**:
  ```json
  {
    "user_id": "string",
    "prefered_min_age": "number",
    "prefered_max_age": "number",
    "prefered_gender": "string"
  }
  ```
- **Response**: JSON object with update result

### 13. Verify Photos
- **Endpoint**: `GET /user/v1/verifyPhotos?user_id={user_id}`
- **Base URL**: Node.js Backend
- **Description**: Verify user photos
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Response**: JSON object with verification result

### 14. Delete User Account
- **Endpoint**: `DELETE /user/v1/deleteUserPermanently/{user_id}`
- **Base URL**: Node.js Backend
- **Description**: Permanently delete user account
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Response**: JSON object with deletion result

---

## Matching & Discovery APIs

### 15. Get Match Users
- **Endpoint**: `GET /user/v1/newMatchAlgo2?preferred_gender={gender}&new_user_id={user_id}`
- **Base URL**: Node.js Backend
- **Description**: Get potential matches for a user
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Query Parameters**:
  - `preferred_gender`: String (UPPERCASE)
  - `new_user_id`: String
- **Response**: JSON object with match users

### 16. Get Match Users for Chat
- **Endpoint**: `GET /user/v1/getLogMatchUsersForChat?current_user_id={user_id}`
- **Base URL**: Node.js Backend
- **Description**: Get matched users for chat functionality
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Query Parameters**:
  - `current_user_id`: String
- **Response**: JSON object with chat matches

### 17. Disqualify User
- **Endpoint**: `POST /user/v1/disQualifyUser`
- **Base URL**: Node.js Backend
- **Description**: Disqualify/reject a potential match
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Request Body**:
  ```json
  {
    "user_id": "string",
    "disqualify_user_id": "string",
    "reason": "string",
    "type": "string"
  }
  ```
- **Response**: JSON object with disqualification result

---

## Joker Card System APIs

### 18. Get User Joker Cards
- **Endpoint**: `GET /user/v1/getJokerCards?preferred_gender={gender}&new_user_id={user_id}&isSystemAssigned={boolean}`
- **Base URL**: Node.js Backend
- **Description**: Get available joker cards for user
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Query Parameters**:
  - `preferred_gender`: String
  - `new_user_id`: String
  - `isSystemAssigned`: Boolean
- **Response**: JSON object with joker cards

### 19. Assign Joker to User
- **Endpoint**: `POST /user/v1/assignJokerToUser`
- **Base URL**: Node.js Backend
- **Description**: Assign a joker card to a user
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Request Body**:
  ```json
  {
    "from_user_id": "string",
    "to_user_id": "string",
    "jokercard": "string",
    "isSystemAssigned": "boolean"
  }
  ```
- **Response**: JSON object with assignment result

### 20. Get Users for Joker Card
- **Endpoint**: `GET /user/v1/getUsersforJokerCard?current_user_id={user_id}`
- **Base URL**: Node.js Backend
- **Description**: Get users eligible for joker card assignment
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Query Parameters**:
  - `current_user_id`: String
- **Response**: JSON object with eligible users

---

## Questions & Answers APIs

### 21. Get All Questions
- **Endpoint**: `GET /questions/v1/getAllQuestions?page=1&limit=10`
- **Base URL**: Node.js Backend
- **Description**: Retrieve all available questions for users
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Query Parameters**:
  - `page`: Number (default: 1)
  - `limit`: Number (default: 10)
- **Response**: JSON object with questions list

### 22. Add Answer to Question
- **Endpoint**: `POST /answers/v1/createanswer`
- **Base URL**: Node.js Backend
- **Description**: Submit answer to a question
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Request Body**:
  ```json
  {
    "user_id": "string",
    "question_id": "string",
    "answer": "string"
  }
  ```
- **Response**: JSON object with answer submission result

---

## Voice Notes & Media APIs

### 23. Add Voice Notes
- **Endpoint**: `POST /user/v1/updateVoiceNotes`
- **Base URL**: Node.js Backend
- **Description**: Add or update user voice notes
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Request Body**:
  ```json
  {
    "user_id": "string",
    "note": "string",
    "bio_notes": "string"
  }
  ```
- **Response**: JSON object with voice notes update result

### 24. Generate Waveform Image
- **Endpoint**: `POST /waveform`
- **Base URL**: Node.js Backend
- **Description**: Generate waveform image from audio URL
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Request Body**:
  ```json
  {
    "cloudinaryUrl": "string"
  }
  ```
- **Response**: JSON object with waveform image URL

---

## Call & Video APIs

### 25. Initiate Call
- **Endpoint**: `POST /initiate-call`
- **Base URL**: Node.js Backend
- **Description**: Initiate a call between users
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Request Body**:
  ```json
  {
    "callerId": "string",
    "receiverId": "string",
    "callType": "string"
  }
  ```
- **Response**: JSON object with call initiation result

### 26. Answer Call
- **Endpoint**: `POST /user/v1/answerTheCall`
- **Base URL**: Node.js Backend
- **Description**: Answer an incoming call
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Request Body**:
  ```json
  {
    "chat_room_name": "string",
    "call_type": "string",
    "start_time": "ISO Date String"
  }
  ```
- **Response**: JSON object with call answer result

### 27. End Call
- **Endpoint**: `POST /user/v1/endTheCall`
- **Base URL**: Node.js Backend
- **Description**: End an ongoing call
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Request Body**:
  ```json
  {
    "chat_room_name": "string",
    "call_type": "string",
    "end_time": "ISO Date String"
  }
  ```
- **Response**: JSON object with call end result

### 28. Decline Video Call
- **Endpoint**: `POST /declineVideo-call`
- **Base URL**: Node.js Backend
- **Description**: Decline an incoming video call
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Request Body**:
  ```json
  {
    "callerId": "string",
    "receiverId": "string",
    "callType": "DECLINEVIDEOCALL"
  }
  ```
- **Response**: JSON object with decline result

---

## Fate Roulette APIs

### 29. Initiate Roulette Call
- **Endpoint**: `POST /initiate-rullet-call`
- **Base URL**: Node.js Backend
- **Description**: Initiate a fate roulette call
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Request Body**:
  ```json
  {
    "callerId": "string",
    "receiverId": "string",
    "callType": "string"
  }
  ```
- **Response**: JSON object with roulette call initiation result

### 30. Decline Roulette Call
- **Endpoint**: `POST /declineRullet-call`
- **Base URL**: Node.js Backend
- **Description**: Decline a fate roulette call
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Request Body**:
  ```json
  {
    "callerId": "string",
    "receiverId": "string",
    "callType": "DECLINERULLETCALL"
  }
  ```
- **Response**: JSON object with decline result

### 31. Find User in Waiting Pool
- **Endpoint**: `GET /user/v1/findUserInWaitingPool?user_id={user_id}`
- **Base URL**: Node.js Backend
- **Description**: Find a user in the roulette waiting pool
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Query Parameters**:
  - `user_id`: String
- **Response**: JSON object with waiting pool status

### 32. Add User to Waiting Pool
- **Endpoint**: `GET /user/v1/addUserInCallWaitingPool?user_id={user_id}`
- **Base URL**: Node.js Backend
- **Description**: Add user to call waiting pool
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Query Parameters**:
  - `user_id`: String
- **Response**: JSON object with addition result

### 33. Remove User from Fate Roulette
- **Endpoint**: `GET /user/v1/removeUserFromFateRullet?user_id={user_id}`
- **Base URL**: Node.js Backend
- **Description**: Remove user from fate roulette system
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Query Parameters**:
  - `user_id`: String
- **Response**: JSON object with removal result

### 34. Fate Roulette User for Call
- **Endpoint**: `GET /user/v1/fateRulletUserForCall?user_id={user_id}`
- **Base URL**: Node.js Backend
- **Description**: Get fate roulette user for call matching
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Query Parameters**:
  - `user_id`: String
- **Response**: JSON object with roulette user details

### 35. Update Match by Fate Roulette
- **Endpoint**: `GET /user/v1/updateMatchByFateRullet?currentUser={currentUser}&otherUser={otherUser}&NewMatch={NewMatch}`
- **Base URL**: Node.js Backend
- **Description**: Update match status through fate roulette
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Query Parameters**:
  - `currentUser`: String
  - `otherUser`: String
  - `NewMatch`: String
- **Response**: JSON object with match update result

### 36. Get Fate Roulette Users from Waiting Pool
- **Endpoint**: `GET /getFateRulletUsersMatchFromWaitingPool?user_id={user_id}`
- **Base URL**: Node.js Backend
- **Description**: Get fate roulette users from waiting pool
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Query Parameters**:
  - `user_id`: String
- **Response**: JSON object with waiting pool users

### 37. Add Roulette Log
- **Endpoint**: `POST /user/v1/addrulletLog`
- **Base URL**: Node.js Backend
- **Description**: Add log entry for roulette activity
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Request Body**:
  ```json
  {
    "chatroom_id": "string",
    "action_from": "string",
    "action_response": "string",
    "new_match_user_id": "string",
    "with_swap_match_user_id": "string"
  }
  ```
- **Response**: JSON object with log addition result

### 38. Match Decision After Roulette
- **Endpoint**: `POST /user/v1/matchdecisionAfterRullet`
- **Base URL**: Node.js Backend
- **Description**: Record match decision after roulette session
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Request Body**:
  ```json
  {
    "currentUserResponse": "string",
    "otherUserResponse": "string"
  }
  ```
- **Response**: JSON object with decision result

### 39. Send Fate Roulette Response
- **Endpoint**: `POST /getFateRulletUserResponseFromOtherUser`
- **Base URL**: Node.js Backend
- **Description**: Send fate roulette user response to other user
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Request Body**:
  ```json
  {
    "accpeted_user_id": "string",
    "to_tell_user_id": "string"
  }
  ```
- **Response**: JSON object with response result

---

## Match Request APIs

### 40. Send New Match Request
- **Endpoint**: `GET /user/v1/sendNewMatchReq?currentUserId={currentUserId}&exsistingMatchId={exsistingMatchId}&newMatchId={newMatchId}`
- **Base URL**: Node.js Backend
- **Description**: Send a new match request
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Query Parameters**:
  - `currentUserId`: String
  - `exsistingMatchId`: String
  - `newMatchId`: String
- **Response**: JSON object with match request result

### 41. Accept Match Request
- **Endpoint**: `GET /user/v1/acceptMatchReq?currentUserId={currentUserId}&exsistingMatchId={exsistingMatchId}&newMatchId={newMatchId}`
- **Base URL**: Node.js Backend
- **Description**: Accept a match request
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Query Parameters**:
  - `currentUserId`: String
  - `exsistingMatchId`: String
  - `newMatchId`: String
- **Response**: JSON object with acceptance result

### 42. Decline Match Request
- **Endpoint**: `GET /user/v1/declineMatchReq?currentUserId={currentUserId}&exsistingMatchId={exsistingMatchId}&newMatchId={newMatchId}`
- **Base URL**: Node.js Backend
- **Description**: Decline a match request
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Query Parameters**:
  - `currentUserId`: String
  - `exsistingMatchId`: String
  - `newMatchId`: String
- **Response**: JSON object with decline result

---

## Subscription & Tokens APIs

### 43. Update User Subscription
- **Endpoint**: `POST /user/v1/updateUserSubscription`
- **Base URL**: Node.js Backend
- **Description**: Update user subscription type
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Request Body**:
  ```json
  {
    "user_id": "string",
    "subscription_type": "string"
  }
  ```
- **Response**: JSON object with subscription update result

### 44. Get All Tokens
- **Endpoint**: `GET /user/v1/getAllTokens?user_id={user_id}`
- **Base URL**: Node.js Backend
- **Description**: Get all tokens for a user
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Query Parameters**:
  - `user_id`: String
- **Response**: JSON object with user tokens

### 45. Add Token
- **Endpoint**: `GET /user/v1/addToken?user_id={user_id}&new_tokens={new_tokens}`
- **Base URL**: Node.js Backend
- **Description**: Add tokens to user account
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Query Parameters**:
  - `user_id`: String
  - `new_tokens`: Number
- **Response**: JSON object with token addition result

### 46. Delete Token
- **Endpoint**: `GET /user/v1/deleteToken?user_id={user_id}&new_tokens={new_tokens}`
- **Base URL**: Node.js Backend
- **Description**: Remove tokens from user account
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Query Parameters**:
  - `user_id`: String
  - `new_tokens`: Number
- **Response**: JSON object with token deletion result

---

## Reporting & Blocking APIs

### 47. Report User
- **Endpoint**: `POST /user/v1/reportUser`
- **Base URL**: Node.js Backend
- **Description**: Report a user for inappropriate behavior
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Request Body**:
  ```json
  {
    "reported_by_user_id": "string",
    "reported_user_id": "string",
    "reason": "string"
  }
  ```
- **Response**: JSON object with report submission result

### 48. Block User
- **Endpoint**: `POST /user/v1/reportUser`
- **Base URL**: Node.js Backend
- **Description**: Block a user (uses same endpoint as report)
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Request Body**:
  ```json
  {
    "reported_by_user_id": "string (blocked_by_user_id)",
    "reported_user_id": "string (blocked_user_id)",
    "reason": "string (optional)"
  }
  ```
- **Response**: JSON object with block result

---

## Analytics & Insights APIs

### 49. Get User Insights
- **Endpoint**: `GET /user/v1/getUserInsights?user_id={user_id}&date_type={date_type}`
- **Base URL**: Node.js Backend
- **Description**: Get user analytics and insights
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Query Parameters**:
  - `user_id`: String
  - `date_type`: String
- **Response**: JSON object with user insights data

---

## Social Integration APIs

### 50. Connect Spotify
- **Endpoint**: `POST /user/v1/connectSpotify`
- **Base URL**: Node.js Backend
- **Description**: Connect user's Spotify account
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Request Body**:
  ```json
  {
    "user_id": "string",
    "spotify_data": "object"
  }
  ```
- **Response**: JSON object with Spotify connection result

### 51. Connect Instagram
- **Endpoint**: `POST /user/v1/connectInstagram`
- **Base URL**: Node.js Backend
- **Description**: Connect user's Instagram account
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Request Body**:
  ```json
  {
    "user_id": "string",
    "instagram_data": "object"
  }
  ```
- **Response**: JSON object with Instagram connection result

---

## Utility APIs

### 52. Get Response
- **Endpoint**: `POST /user/v1/get-response`
- **Base URL**: Node.js Backend
- **Description**: Get response for user email
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Request Body**:
  ```json
  {
    "email": "string"
  }
  ```
- **Response**: JSON object with response data

---

## File Upload APIs

### 53. Upload File
- **Endpoint**: `POST /upload-file`
- **Base URL**: Node.js Backend
- **Description**: Upload files (images, audio, etc.)
- **Headers**:
  ```json
  {
    "Content-Type": "multipart/form-data"
  }
  ```
- **Request Body** (FormData):
  ```
  file: Binary file data
  ```
- **Response**:
  ```json
  {
    "error": false,
    "msg": "File uploaded successfully",
    "data": {
      "fullUrl": "string"
    }
  }
  ```

---

## Third-Party Integration APIs

### 54. Spotify API - Get Playlists
- **Endpoint**: `GET /v1/me/playlists?limit=1`
- **Base URL**: `https://api.spotify.com`
- **Description**: Get user's Spotify playlists
- **Headers**:
  ```json
  {
    "Authorization": "Bearer {access_token}"
  }
  ```
- **Response**: JSON object with playlist data

### 55. Spotify API - Get Playlist Tracks
- **Endpoint**: `GET /v1/playlists/{playlist_id}/tracks`
- **Base URL**: `https://api.spotify.com`
- **Description**: Get tracks from a specific playlist
- **Headers**:
  ```json
  {
    "Authorization": "Bearer {access_token}"
  }
  ```
- **Response**: JSON object with track data

### 56. Instagram API - Get User Media
- **Endpoint**: `GET /me/media?fields=id,caption,media_type,media_url,timestamp&access_token={token}`
- **Base URL**: `https://graph.instagram.com`
- **Description**: Get user's Instagram media
- **Response**: JSON object with media data

### 57. Instagram API - Get User Profile
- **Endpoint**: `GET /me?fields=id,profile_picture_url,username,account_type,media_count&access_token={token}`
- **Base URL**: `https://graph.instagram.com`
- **Description**: Get user's Instagram profile information
- **Response**: JSON object with profile data

---

## Real-Time Communication APIs (WebSocket/Socket.IO)

### Base WebSocket URL
- **URL**: `wss://backend.fatedating.com` (WebSocket connection)

### 1. Join Chat Room
- **Event**: `joinChat`
- **Description**: Join a chat room for real-time messaging
- **Emit Data**:
  ```json
  {
    "roomId": "string",
    "userId": "string",
    "token": "string"
  }
  ```
- **Listen Events**:
  - `chatJoined`: Confirmation of successful room join
  - `userJoined`: When another user joins the chat
  - `userLeft`: When a user leaves the chat

### 2. Send Real-Time Message
- **Event**: `sendMessage`
- **Description**: Send a message in real-time to a chat room
- **Emit Data**:
  ```json
  {
    "roomId": "string",
    "message": "string",
    "senderId": "string",
    "messageType": "text|image|audio|video",
    "timestamp": "ISO Date String",
    "messageData": "object (optional - for media messages)"
  }
  ```
- **Listen Events**:
  - `messageReceived`: When a new message is received
  - `messageDelivered`: Confirmation message was delivered
  - `messageRead`: When message is read by recipient

### 3. Join Video Call Room
- **Event**: `joinVideoCall`
- **Description**: Join a video call room for real-time video communication
- **Emit Data**:
  ```json
  {
    "callId": "string",
    "userId": "string",
    "userType": "caller|receiver",
    "token": "string"
  }
  ```
- **Listen Events**:
  - `callJoined`: Confirmation of call join
  - `callStarted`: When call begins
  - `callEnded`: When call ends
  - `userVideoToggled`: When user toggles video
  - `userAudioToggled`: When user toggles audio

### 4. Join Audio Call Room
- **Event**: `joinAudioCall`
- **Description**: Join an audio call room for real-time voice communication
- **Emit Data**:
  ```json
  {
    "callId": "string",
    "userId": "string",
    "userType": "caller|receiver",
    "token": "string"
  }
  ```
- **Listen Events**:
  - `callJoined`: Confirmation of call join
  - `callStarted`: When call begins
  - `callEnded`: When call ends
  - `userAudioToggled`: When user toggles audio
  - `callMuted`: When user mutes/unmutes

### 5. Message History
- **Event**: `getMessageHistory`
- **Description**: Get chat message history for a room
- **Emit Data**:
  ```json
  {
    "roomId": "string",
    "page": "number (optional)",
    "limit": "number (optional)"
  }
  ```
- **Listen Events**:
  - `messageHistory`: Returns array of historical messages

### 6. Typing Indicators
- **Event**: `userTyping`
- **Description**: Indicate user is typing in a chat
- **Emit Data**:
  ```json
  {
    "roomId": "string",
    "userId": "string",
    "isTyping": "boolean"
  }
  ```
- **Listen Events**:
  - `userTyping`: When another user starts/stops typing

### 7. Connection Management
- **Events**:
  - `connect`: WebSocket connection established
  - `disconnect`: WebSocket connection lost
  - `reconnect`: WebSocket reconnection successful
  - `error`: Connection or message error

---

## Additional HTTP APIs

### Mark Messages as Read
- **Endpoint**: `PUT /messages/v1/markAsRead`
- **Base URL**: Node.js Backend
- **Description**: Mark chat messages as read
- **Headers**:
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Authorization": "Bearer {token}"
  }
  ```
- **Request Body**:
  ```json
  {
    "roomId": "string",
    "messageIds": "array of strings",
    "userId": "string"
  }
  ```
- **Response**: JSON object with read status confirmation

---

## Error Handling

All APIs follow standard HTTP status codes:
- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

### Common Error Response Format:
```json
{
  "error": true,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

### Common Success Response Format:
```json
{
  "error": false,
  "message": "Success message",
  "data": { ... }
}
```

---

## Authentication Notes

1. **FCM Token**: Required for push notifications, included as `device_id` in authentication requests
2. **Role**: Always set to "user" for regular app users
3. **Session Management**: Tokens and session data are managed server-side
4. **Social Authentication**: Spotify and Instagram tokens are handled separately

---

## Rate Limiting

- API calls may be rate-limited per user/IP
- Subscription type may affect rate limits
- Token-based operations have specific quotas

---

## Data Types

- **String**: Text data
- **Number**: Numeric values
- **Boolean**: true/false values
- **Array**: List of items
- **Object**: JSON object with key-value pairs
- **ISO Date String**: Date in ISO 8601 format (e.g., "2024-01-15T10:30:00Z")

---

## Notes

1. Some endpoints use GET requests with query parameters instead of POST with request body
2. File uploads use multipart/form-data content type
3. All date/time values should be in UTC
4. Image uploads return secure URLs for accessing uploaded content
5. Voice notes and waveform generation are tightly integrated for audio features
6. Fate Roulette is a core feature with multiple related endpoints for real-time matching
7. **Real-time Communication**: WebSocket/Socket.IO is used for chat messaging, video/audio calls, and live updates
8. **Message Management**: Both HTTP APIs (for message history/status) and WebSocket (for real-time messaging) are used
9. **Call Management**: Video and audio calls use WebSocket for real-time communication with HTTP APIs for call initiation/management
10. **Authentication**: WebSocket connections require valid authentication tokens for secure real-time communication

---

## Implementation Notes for Developers

### WebSocket Connection
```javascript
// Example WebSocket connection
const socket = io('wss://backend.fatedating.com', {
  auth: {
    token: 'your-auth-token'
  }
});

// Join chat room
socket.emit('joinChat', {
  roomId: 'room-id',
  userId: 'user-id',
  token: 'auth-token'
});

// Listen for messages
socket.on('messageReceived', (data) => {
  console.log('New message:', data);
});
```

### File Upload with Progress
```javascript
// Example file upload with progress tracking
const formData = new FormData();
formData.append('file', file);
formData.append('type', 'image');

fetch('https://backend.fatedating.com/upload-file', {
  method: 'POST',
  body: formData,
  onUploadProgress: (progressEvent) => {
    const progress = (progressEvent.loaded / progressEvent.total) * 100;
    console.log(`Upload progress: ${progress}%`);
  }
});
```

### Error Handling Best Practices
```javascript
// HTTP API error handling
try {
  const response = await fetch('/api/endpoint');
  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.message);
  }
  
  return data;
} catch (error) {
  console.error('API Error:', error.message);
}

// WebSocket error handling
socket.on('error', (error) => {
  console.error('WebSocket Error:', error);
  // Implement reconnection logic
});
```

---

**Last Updated**: January 2024  
**Total Endpoints Documented**: 65+  
**Coverage**: Complete API coverage including HTTP REST APIs and WebSocket real-time communication
