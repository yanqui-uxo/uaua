import Theremin from "@/components/Theremin";
import { SafeAreaView } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function Index() {
  return (
    <GestureHandlerRootView>
      <SafeAreaView style={{ flex: 1 }}>
        <Theremin />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
