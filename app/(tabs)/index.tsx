import OscillatorTypeSelector from "@/components/OscillatorTypeSelector";
import RecordButton from "@/components/RecordButton";
import Theremin from "@/components/Theremin";
import { audioContext, RecordingsContext } from "@/context";
import ThereminRecorder from "@/theremin/theremin_recorder";
import ToneThereminNode from "@/theremin/tone_theremin_node";
import { use, useState } from "react";
import { SafeAreaView } from "react-native";
import { OscillatorType } from "react-native-audio-api";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const recorder = new ThereminRecorder(audioContext);

export default function Index() {
  const [oscillatorType, setOscillatorType] = useState<OscillatorType>("sine");
  const { recordings, setRecordings } = use(RecordingsContext);
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
        <RecordButton
          audioContext={audioContext}
          recorder={recorder}
          onRecord={(r) => setRecordings([...recordings, r])}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
