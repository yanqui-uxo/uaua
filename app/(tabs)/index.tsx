import OscillatorTypeSelector from "@/components/OscillatorTypeSelector";
import RecordButton from "@/components/RecordButton";
import Theremin from "@/components/Theremin";
import { audioContext, useRecordingStore } from "@/global";
import ThereminRecorder from "@/theremin/theremin_recorder";
import ToneThereminNode from "@/theremin/tone_theremin_node";
import { useState } from "react";
import { SafeAreaView } from "react-native";
import { OscillatorType } from "react-native-audio-api";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const recorder = new ThereminRecorder(audioContext);

export default function Index() {
  const [oscillatorType, setOscillatorType] = useState<OscillatorType>("sine");
  const addRecording = useRecordingStore((state) => state.addRecording);
  return (
    <GestureHandlerRootView>
      <SafeAreaView style={{ flex: 1 }}>
        <OscillatorTypeSelector
          currentValue={oscillatorType}
          onSelect={setOscillatorType}
        />
        <Theremin
          recorder={recorder}
          makeNode={(ac) => new ToneThereminNode(ac, oscillatorType)}
        />
        <RecordButton recorder={recorder} onRecord={(r) => addRecording(r)} />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
