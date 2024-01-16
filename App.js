import { SafeAreaView, Text, View } from "react-native";
import tailwind from "tailwind-rn";
import HomeScreen from './src/screens/HomeScreen';

export default function App() {
  return (
    <SafeAreaView style={tailwind("flex-1 items-center justify-center")}>
      <HomeScreen/>
    </SafeAreaView>
  );
}
