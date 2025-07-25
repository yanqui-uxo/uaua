import { SafeAreaView } from "react-native";
import { AudioContext } from "react-native-audio-api";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import OscillatorTypeSelector from "@/components/OscillatorTypeSelector";
import RecordButtons from "@/components/RecordButtons";
import Theremin from "@/components/Theremin";
import ThereminRecorder from "@/util/theremin_recorder";
import ToneThereminNode from "@/util/tone_theremin_node";
import { useState } from "react";

const audioContext = new AudioContext();
const recorder = new ThereminRecorder(audioContext, ToneThereminNode);
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
          nodeConstructor={ToneThereminNode}
          params={[oscillatorType]}
        />
        <RecordButtons audioContext={audioContext} recorder={recorder} />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
