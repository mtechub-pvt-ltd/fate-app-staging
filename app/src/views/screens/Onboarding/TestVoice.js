import React, { useState, useEffect } from 'react';
import { View, Button, TextInput, Text, Alert, StyleSheet } from 'react-native';
import Voice from '@react-native-voice/voice';
import { SafeAreaView } from 'react-native-safe-area-context';

const TestVoice = () => {
  const [started, setStarted] = useState(false);
  const [result, setResult] = useState('');
  const [textField, setTextField] = useState('');
  const [partialResults, setPartialResults] = useState([]);
  const [error, setError] = useState('');
  const [recognized, setRecognized] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  const initializeVoice = () => {
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechPartialResults = onSpeechPartialResults;
    Voice.onSpeechRecognized = onSpeechRecognized;
  };

  useEffect(() => {
    checkVoiceAvailability();
    initializeVoice();
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const checkVoiceAvailability = async () => {
    try {
      const available = await Voice.isAvailable();
      setIsAvailable(available);
      if (!available) {
        Alert.alert(
          'Voice Recognition Not Available',
          'Voice recognition is not available on this device.'
        );
      }
    } catch (e) {
      console.error('Error checking voice availability:', e);
      setIsAvailable(false);
    }
  };

  const onSpeechStart = (e) => {
    console.log('onSpeechStart: ', e);
    setStarted(true);
    setError('');
    setRecognized(false);
  };

  const onSpeechRecognized = (e) => {
    console.log('onSpeechRecognized: ', e);
    setRecognized(true);
  };

  const onSpeechEnd = (e) => {
    console.log('onSpeechEnd: ', e);
    setStarted(false);
  };

  const onSpeechResults = (e) => {
    console.log('onSpeechResults: ', e);
    if (e.value && e.value.length > 0) {
      const recognizedText = e.value[0];
      setResult(recognizedText);
      // Automatically append to text field when recognition is complete
      setTextField(prev => (prev ? prev + ' ' : '') + recognizedText.trim());
    }
  };

  const onSpeechPartialResults = (e) => {
    console.log('onSpeechPartialResults: ', e);
    if (e.value && e.value.length > 0) {
      setPartialResults(e.value);
      setResult(e.value[0]); // Show live partial result
    }
  };

  const onSpeechError = (e) => {
    console.error('onSpeechError: ', e);
    setError(e.error);
    setStarted(false);
    setRecognized(false);

    // Handle specific errors
    if (e.error === 'permissions') {
      Alert.alert(
        'Permission Required',
        'Please grant microphone permission to use voice recognition.',
        [{ text: 'OK' }]
      );
    } else if (e.error === 'recognizer_busy') {
      Alert.alert(
        'Recognition Busy',
        'Voice recognition is already in progress. Please wait.',
        [{ text: 'OK' }]
      );
    } else if (e.error === 'no_match') {
      Alert.alert(
        'No Speech Detected',
        'No speech was recognized. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const startSpeech = async () => {
    if (!isAvailable) {
      Alert.alert('Voice Recognition Not Available', 'Voice recognition is not available on this device.');
      return;
    }

    try {
      // Clear previous results
      setResult('');
      setPartialResults([]);
      setError('');
      setRecognized(false);

      // Destroy previous instance and remove listeners
      await Voice.destroy();
      await Voice.removeAllListeners();

      // Re-initialize listeners
      initializeVoice();

      // Start recognition with proper locale
      await Voice.start('en-US');
    } catch (e) {
      console.error('Error starting Voice:', e);
      setStarted(false);
      setError('Failed to start voice recognition');

      Alert.alert(
        'Voice Recognition Error',
        'Failed to start voice recognition. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const stopSpeech = async () => {
    try {
      await Voice.stop();
    } catch (e) {
      console.error('Error stopping Voice:', e);
    }
  };

  const cancelSpeech = async () => {
    try {
      await Voice.cancel();
      setStarted(false);
      setResult('');
      setPartialResults([]);
    } catch (e) {
      console.error('Error canceling Voice:', e);
    }
  };

  const clearText = () => {
    setTextField('');
    setResult('');
    setPartialResults([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Voice to Text</Text>

        {/* Status indicators */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            Available: {isAvailable ? '✓' : '✗'}
          </Text>
          <Text style={styles.statusText}>
            Started: {started ? '✓' : '✗'}
          </Text>
          <Text style={styles.statusText}>
            Recognized: {recognized ? '✓' : '✗'}
          </Text>
        </View>

        {/* Error display */}
        {error ? (
          <Text style={styles.errorText}>Error: {error}</Text>
        ) : null}

        {/* Live results */}
        <Text style={styles.label}>Live Recognition:</Text>
        <Text style={styles.result}>{result || 'No speech detected yet...'}</Text>

        {/* Partial results */}
        {partialResults.length > 0 && (
          <View>
            <Text style={styles.label}>Partial Results:</Text>
            {partialResults.map((partialResult, index) => (
              <Text key={index} style={styles.partialResult}>
                {partialResult}
              </Text>
            ))}
          </View>
        )}

        {/* Control buttons */}
        <View style={styles.buttonContainer}>
          <Button
            title={started ? 'Stop Recording' : 'Start Recording'}
            onPress={started ? stopSpeech : startSpeech}
            disabled={!isAvailable}
          />

          {started && (
            <Button
              title="Cancel"
              onPress={cancelSpeech}
              color="#ff6b6b"
            />
          )}

          <Button
            title="Clear Text"
            onPress={clearText}
            color="#ffa500"
          />
        </View>

        {/* Text input field */}
        <Text style={styles.label}>Transcribed Text:</Text>
        <TextInput
          style={styles.textInput}
          multiline
          value={textField}
          onChangeText={setTextField}
          placeholder="Your transcribed text will appear here..."
          placeholderTextColor="#999"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 14,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  result: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    minHeight: 50,
    textAlignVertical: 'top',
  },
  partialResult: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    minHeight: 120,
    backgroundColor: '#fff',
    fontSize: 16,
    textAlignVertical: 'top',
  },
});

export default TestVoice;
