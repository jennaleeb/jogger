// HomeScreen.js

import React, { useState } from 'react';
import { Text, View, TouchableOpacity } from "react-native";
import { Picker } from '@react-native-picker/picker';
import tailwind from "tailwind-rn";
import ResetIcon from '../components/icons/ResetIcon';
import AuthIcon from '../components/icons/AuthIcon';
import { WebView } from 'react-native-webview';

const HomeScreen = () => {
  const [responseData, setResponseData] = useState('');
  const [selectedDistance, setSelectedDistance] = useState(5.00);
  const [selectedTime, setSelectedTime] = useState(1200.00);
  const [webViewOpen, setWebViewOpen] = useState(false);
  const [authCode, setAuthCode] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  const resetData = () => {
    setResponseData('');
    setSelectedDistance(5.00);
    setSelectedTime(1200.00);
  }

  // const token = Config.STRAVA_TOKEN;
  const getAccessToken = async () => {
    if (!authCode) {
      console.log('no auth code, returning')
      return;
    }

    if (accessToken) {
      return accessToken;
    }

    const url = 'https://www.strava.com/oauth/token';
    const headers = {
      'Content-Type': 'application/json',
    };
    const body = {
      'client_id': process.env.EXPO_PUBLIC_CLIENT_ID,
      'client_secret': process.env.EXPO_PUBLIC_CLIENT_SECRET,
      'code': authCode,
      'grant_type': 'authorization_code'
    }

    try {
      const response = await fetch(url, { method: 'POST', headers: headers, body: JSON.stringify(body) });
      const data = await response.json();
      const accessToken = data["access_token"]
      setAccessToken(accessToken);
      return accessToken
    } catch (error) {
     console.log(error);
    }
  }

  const postActivityData = async (accesToken) => {
    const url = 'https://www.strava.com/api/v3/activities';
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accesToken}`,
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
      if (data["errors"]?.length > 0 || data["message"] == "error") {
        setResponseData(`Error: ${data["message"]}`)
      } else {
        setResponseData(`Success! Sent run of ${selectedDistance} km and ${formatTime(selectedTime)} minutes`);
        return data;
      }
    } catch (error) {
      setResponseData(`Error: ${error}`)
    }
  };

  const handleApiCall = async () => {
    try {
      const accessToken = await getAccessToken();
      const result = await postActivityData(accessToken);
      console.log(result)
    } catch (error) {
      console.error('Error:', error);
    }
  }

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
        <View style={tailwind("h-8 w-8")}>
          <ResetIcon/>
        </View>
      </TouchableOpacity>
    )
  }

  const handleOpenAuthView = () => {
    setWebViewOpen(true);
    setResponseData('');
  }

  const openAuthComponent = () => {
    return(
      <TouchableOpacity onPress={handleOpenAuthView}>
        <View style={tailwind("h-8 w-8")}>
          <AuthIcon/>
        </View>
      </TouchableOpacity>
    )
  }

  const handleNavigationStateChange = (newNavState) => {
    const url = newNavState.url;
    console.log(url);
    if (!url) {
      return;
    }

    const match = url.match(/code=([^&]*)/);
    const code = match ? match[1] : null;
    setAuthCode(code);

    if (code) {
      setWebViewOpen(false);
      console.log('success! - code:', code)
    }
  }

  const authComponent = () => {
    return(
      webViewOpen && 
      <WebView
        source={{ uri: 'https://www.strava.com/oauth/authorize?client_id=119421&response_type=code&redirect_uri=http://localhost/exchange_token&approval_prompt=force&scope=activity:write' }}
        onNavigationStateChange={handleNavigationStateChange}
        style={tailwind("w-full")}
      />
    )
  }

  return (
    <>
      {
        !webViewOpen &&
        <View style={tailwind("flex-1 items-center justify-center")}>
          <View style={tailwind("w-full flex flex-row justify-between p-4")}>
            {openAuthComponent()}
            {resetComponent()}
          </View>
          {distancePicker()}
          {timePicker()}
          {submitButton()}
          <Text style={tailwind("text-center")}>{responseData}</Text>
        </View>
      }
      {authComponent()}
    </>
  );
};

export default HomeScreen;
