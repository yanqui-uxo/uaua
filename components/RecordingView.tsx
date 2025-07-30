import { audioContext, useRecordingStore } from "@/global";
import { Button, TextInput, View } from "react-native";
export default function RecordingView({ index }: { index: number }) {
  const recording = useRecordingStore((state) => state.recordings[index]);
  const setName = useRecordingStore((state) => state.setName);

  return (
    <View style={{ flexDirection: "row" }}>
      <TextInput
        style={{ flex: 2, borderWidth: 1 }}
        value={recording.name}
        placeholder="(Type name)"
        placeholderTextColor="gray"
        onChangeText={(text) => setName(index, text)}
      />
      <View style={{ flex: 1, borderWidth: 1 }}>
        <Button
          title="Play"
          onPress={() => {
            const node = audioContext.createBufferSource();
            node.buffer = recording.buffer;
            node.connect(audioContext.destination);
            node.start();
          }}
        />
      </View>
    </View>
  );
}
