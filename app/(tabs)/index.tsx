import OscillatorTypeSelector from "@/components/OscillatorTypeSelector";
import RecordButton from "@/components/RecordButton";
import Theremin from "@/components/Theremin";
import { audioContext, useThereminSourceStore } from "@/global";
import ThereminRecorder from "@/theremin/theremin_recorder";
import ToneThereminNode from "@/theremin/tone_theremin_node";
import { useState } from "react";
import { SafeAreaView } from "react-native";
import { OscillatorType } from "react-native-audio-api";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const recorder = new ThereminRecorder(audioContext);

// TODO: use sources to make theremins
export default function Index() {
  const [oscillatorType, setOscillatorType] = useState<OscillatorType>("sine");
  const addSource = useThereminSourceStore((state) => state.addSource);
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
          recorder={recorder}
          onRecord={(r) => addSource({ type: "sample", sample: r })}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
