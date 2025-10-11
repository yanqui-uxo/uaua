import MicButton from "@/components/MicButton";
import ThereminCollection from "@/components/ThereminCollection";
import ThereminRecordButton from "@/components/ThereminRecordButton";
import { useThereminSourceStore } from "@/global/state";
import ThereminRecorder from "@/theremin/theremin_recorder";
import { randomUUID } from "expo-crypto";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

const recorder = new ThereminRecorder();

export default function Index() {
  const addSource = useThereminSourceStore((state) => state.addSource);
  return (
    <GestureHandlerRootView>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <View style={{ flex: 1 }}>
          <ThereminCollection recorder={recorder} />
        </View>
        <ThereminRecordButton
          recorder={recorder}
          onRecord={(buf) => {
            addSource({ type: "sample", sample: buf }, randomUUID());
          }}
        />
        <MicButton recorder={recorder} />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
