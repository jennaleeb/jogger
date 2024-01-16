// HomeScreen.js

import React, { useState } from 'react';
import { Text, View, TouchableOpacity } from "react-native";
import { Picker } from '@react-native-picker/picker';
import tailwind from "tailwind-rn";
import ResetIcon from '../components/icons/ResetIcon';
import Config from "react-native-config";

const HomeScreen = () => {
  const [responseData, setResponseData] = useState('');
  const [selectedDistance, setSelectedDistance] = useState(5.00);
  const [selectedTime, setSelectedTime] = useState(1200.00);

  const resetData = () => {
    setResponseData('');
    setSelectedDistance(5.00);
    setSelectedTime(1200.00);
  }

  const token = Config.STRAVA_TOKEN;

  const handleApiCall = async () => {
    const url = 'https://www.strava.com/api/v3/activities';
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
    const currentUtcTime = new Date().toUTCString();

    const body = {
      'name': 'jogger test run',
      'start_date_local': currentUtcTime,
      'elapsed_time': selectedTime,
      'distance': selectedDistance * 1000, // convert to meters
      'sport_type': 'Run',
    }

    try {
      const response = await fetch(url, { method: 'POST', headers: headers, body: JSON.stringify(body) });
      const data = await response.json();
      if (data["errors"]?.length > 0) {
        setResponseData(`Error: ${data["message"]}`)
      } else {
        setResponseData(`Success! Sent run of ${selectedDistance} km and ${formatTime(selectedTime)} minutes`);
      }
    } catch (error) {
      setResponseData(`Error: ${error}`)
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
  
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
  
    return `${formattedMinutes}:${formattedSeconds}`;
  }

  const distancePicker = () => {
    const range = [];

    for (let i = 0.00; i <= 15.00; i += 0.01) {
      range.push(parseFloat(i.toFixed(3))); // Fix floating-point precision issues
    }
    return(
      <View>
        <Text style={tailwind("font-bold text-center text-2xl")}>Distance</Text>
        <Picker
          selectedValue={selectedDistance}
          onValueChange={(itemValue, itemIndex) => setSelectedDistance(itemValue)}>
          <Picker.Item label="Distance (km)" value={null} />
          {range.map((number) => (
            <Picker.Item key={number} label={`${number} km`} value={number} />
          ))}
        </Picker>
      </View>
    )
  }

  const timePicker = () => {
    const timeRange = [];

    for (let i = 0; i <= 72000; i += 1) {
      const t = {"seconds": i, "label": formatTime(i)}
      timeRange.push(t);
    }
    return(
      <View>
        <Text style={tailwind("font-bold text-center text-2xl")}>Elapsed timePicker</Text>
        <Picker
          selectedValue={selectedTime}
          onValueChange={(itemValue, itemIndex) => setSelectedTime(itemValue)}>
          <Picker.Item label="Time (minutes)" value={null} />
          {timeRange.map((number) => (
            <Picker.Item key={number} label={number["label"]} value={number["seconds"]} />
          ))}
        </Picker>
      </View>
    )
  }

  const submitButton = () => {
    return(
      <View style={tailwind("bg-blue-500 px-5 py-3 m-4 rounded-full")}>
        <TouchableOpacity onPress={handleApiCall}>
          <Text style={tailwind("text-white font-semibold text-lg text-center")}>Send to strava! 🏃‍♂️💨</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const resetComponent = () => {
    return(
      <TouchableOpacity onPress={resetData}>
        <View style={tailwind("flex items-end")}>
          <View style={tailwind("h-8 w-8 mb-6 mr-6")}>
            <ResetIcon/>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={tailwind("w-full")}>
      {resetComponent()}
      {distancePicker()}
      {timePicker()}
      {submitButton()}
      <Text style={tailwind("text-center")}>{responseData}</Text>
    </View>
  );
};

export default HomeScreen;
