import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const IncomingCallNotification = ({ callerName, onAnswer, onDecline }) => {
  return (
    <View style={styles.notificationContainer}>
      <Text style={styles.callerText}>{callerName} is calling...</Text>
      <View style={styles.buttonContainer}>
        <Button title="Answer" onPress={onAnswer} color="green" />
        <Button title="Decline" onPress={onDecline} color="red" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  notificationContainer: {
    position: 'absolute',
    top: 0,
    width: '100%',
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
  },
  callerText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
});

export default IncomingCallNotification;
