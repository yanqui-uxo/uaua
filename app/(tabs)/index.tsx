import RecordButton from "@/components/RecordButton";
import ThereminCollection from "@/components/ThereminCollection";
import { useThereminSourceStore } from "@/global";
import ThereminRecorder from "@/theremin/theremin_recorder";
import { SafeAreaView, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const recorder = new ThereminRecorder();

export default function Index() {
  const addSource = useThereminSourceStore((state) => state.addSource);
  return (
    <GestureHandlerRootView>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <ThereminCollection recorder={recorder} />
        </View>
        <RecordButton
          recorder={recorder}
          onRecord={(buf) => {
            addSource({ type: "sample", sample: buf });
          }}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
