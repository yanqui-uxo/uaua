import RecordButton from "@/components/RecordButton";
import ThereminCollection from "@/components/ThereminCollection";
import { useThereminSourceStore } from "@/global";
import ThereminRecorder from "@/theremin/theremin_recorder";
import { SafeAreaView, View } from "react-native";
import { AudioBuffer, OfflineAudioContext } from "react-native-audio-api";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const recorder = new ThereminRecorder();

function trimInitialSilence(buffer: AudioBuffer): AudioBuffer {
  const channels: Float32Array[] = [];
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }
  const firstNonZeroIndex = Math.min(
    ...channels.map((c) => c.findIndex((x) => x !== 0)).filter((i) => i !== -1)
  );

  // used only to create AudioBuffer
  const offlineAudioContext = new OfflineAudioContext({
    numberOfChannels: 0,
    length: 0,
    sampleRate: 0,
  });

  const newChannels = channels.map((c) => c.slice(firstNonZeroIndex));

  const newBuffer = offlineAudioContext.createBuffer(
    buffer.numberOfChannels,
    newChannels[0].length,
    buffer.sampleRate
  );

  for (const [i, channel] of newChannels.entries()) {
    newBuffer.copyToChannel(channel, i);
  }

  return newBuffer;
}

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
            addSource({ type: "sample", sample: trimInitialSilence(buf) });
          }}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
