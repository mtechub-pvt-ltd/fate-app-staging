import {
  StyleSheet,
  Text,
  View,
  Button,
  ActivityIndicator
} from 'react-native'
import React, {
  useEffect
} from 'react'
import { useSelector, useDispatch } from 'react-redux';
import {
  increment,
  decrement,
} from '../../../redux/features/sample/sampleSlice';
import {
  fetchUserData
} from '../../../redux/features/user/userSlice';


export default function Test() {
  const value = useSelector((state) => state.sample.value);
  const dispatch = useDispatch();
  const user = useSelector((state) => state?.user?.data);
  const status = useSelector((state) => state?.user?.status);
  const error = useSelector((state) => state?.user?.error);
  useEffect(() => {
    dispatch(fetchUserData(1)); // Fetch user with ID 1
  }, [dispatch]);

  if (status === 'loading') {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (status === 'failed') {
    return <Text>Error: {error}</Text>;
  }

  return (
    <View
      style={{
        alignContent: 'center',
        justifyContent: 'center',
        flex: 1,
        alignItems: 'center',
      }}
    >

      {user ? (
        <Text
          style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: 'red',
          }}
        >{`User: ${user.name}, Email: ${user.email}`}</Text>
      ) : (
        <Text
          style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: 'red',
          }}
        >No user data available</Text>
      )}

      <Button title="Fetch Another User" onPress={() => dispatch(fetchUserData(value + 1))} />


      <Text
        style={{
          fontSize: 20,
          fontWeight: 'bold',
          color: 'red',
        }}
      >counter Value: {value}</Text>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          backgroundColor: 'red',
          width: '100%',
          marginTop: 20,
        }}
      >
        <Button title="Increment" onPress={() => dispatch(increment())} />
        <Button title="Decrement" onPress={() => dispatch(decrement())} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({})