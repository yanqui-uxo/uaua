import OscillatorTypeSelector from "@/components/OscillatorTypeSelector";
import RecordButtons from "@/components/RecordButtons";
import Theremin from "@/components/Theremin";
import ThereminRecorder from "@/util/theremin_recorder";
import ToneThereminNode from "@/util/tone_theremin_node";
import { useState } from "react";
import { SafeAreaView } from "react-native";
import { AudioContext, OscillatorType } from "react-native-audio-api";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const audioContext = new AudioContext();
const recorder = new ThereminRecorder(audioContext);

export default function Index() {
  const [oscillatorType, setOscillatorType] = useState<OscillatorType>("sine");
  return (
    <GestureHandlerRootView>
      <SafeAreaView style={{ flex: 1 }}>
        <OscillatorTypeSelector
          currentValue={oscillatorType}
          onSelect={setOscillatorType}
        />
        <Theremin
          audioContext={audioContext}
          recorder={recorder}
          nodeMaker={(ac) => new ToneThereminNode(ac, oscillatorType)}
        />
        <RecordButtons audioContext={audioContext} recorder={recorder} />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
