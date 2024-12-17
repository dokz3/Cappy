import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';


const App = () => {
  const [rfid, setRfid] = useState('');
  const [points, setPoints] = useState(null);
  const [showPinField, setShowPinField] = useState(false);
  const [pin, setPin] = useState('');
  const [deactivated, setDeactivated] = useState('');
  const [name, setName] = useState('');

  const handleCheckPoints = async () => {
    if (!rfid) {
      Alert.alert('Error', 'Please enter RFID.');
      return;
    }

    try {
      const userDocument = await firestore()
        .collection('rfid_cards')
        .doc(rfid) // Document ID is the RFID number
        .get();

      if (userDocument.exists) {
        const data = userDocument.data();
        setDeactivated(data?.deactivated);
        setPoints(data?.points);
        setName(data?.name);
      } else {
        Alert.alert('Error', 'RFID not found.');
      }
    } catch (error) {
      console.error('Error fetching points:', error);
      Alert.alert('Error', 'Unable to fetch points. Try again later.');
    }
  };

  const handleDeactivate = async () => {
    if (!rfid) {
      Alert.alert('Error', 'Please enter RFID.');
      return;
    }
    if (!pin) {
      Alert.alert('Error', 'Please enter PIN code.');
      return;
    }

    try {
      const userDocRef = firestore().collection('rfid_cards').doc(rfid);
      const userDocument = await userDocRef.get();

      if (userDocument.exists) {
        const data = userDocument.data();

        if (data?.pin === parseInt(pin)) {
          // PIN matches, proceed with deactivation
          await userDocRef.update({
            deactivated: true,
            points: 0,
          });

          Alert.alert('Success', 'RFID card deactivated and points reset.');
          setRfid('');
          setPin('');
          setPoints(null);
          setShowPinField(false);
        } else {
          // Incorrect PIN
          Alert.alert('Error', 'Incorrect PIN. Please try again.');
        }
      } else {
        Alert.alert('Error', 'RFID not found.');
      }
    } catch (error) {
      console.error('Error deactivating card:', error);
      Alert.alert('Error', 'Unable to deactivate card. Try again later.');
    }
  };

  
  return (
    <View style={styles.container}>
      <View style={styles.formBox}>
        <Text style={styles.label}>RFID:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter RFID"
          value={rfid}
          onChangeText={setRfid}
        />
        <View style={styles.buttonContainer}>
          <Button title="Check Points" onPress={handleCheckPoints} color="#4CAF50" />
        </View>
        {!deactivated && (
          <View style={styles.buttonContainer}>
            <Button
              title="Deactivate Card"
              onPress={() => setShowPinField(true)}
              color="#DC143C"
            />
          </View>
        )}
        {deactivated && (
          <Text style={styles.danger}>The RFID Card is deactivated</Text>
        )}
        {showPinField && !deactivated && (
          <>
            <Text style={styles.label}>Enter PIN:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter PIN"
              value={pin}
              onChangeText={setPin}
              secureTextEntry
            />
            <View style={styles.buttonContainer}>
              <Button title="Confirm Deactivation" onPress={handleDeactivate} color="#FF4500" />
            </View>
          </>
        )}
        {points !== null && !deactivated && (
          <>
            <Text style={styles.pointsText}>RFID Card Owner: {name}</Text>
            <Text style={styles.pointsText}>Available Points: {points}</Text>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  formBox: {
    width: '90%',
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#F9F9F9',
    elevation: 3, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  buttonContainer: {
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  pointsText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  danger: {
    color: '#FF0000'
  }
});

export default App;
