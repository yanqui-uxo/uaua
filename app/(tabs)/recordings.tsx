import { audioContext, RecordingsContext } from "@/context";
import { use } from "react";
import { Button, SafeAreaView } from "react-native";
export default function Recordings() {
  const { recordings } = use(RecordingsContext);
  return (
    <SafeAreaView style={{ flex: 1 }}>
      {recordings.map((r) => (
        <Button
          title="Play"
          key={r.duration.toString()}
          onPress={() => {
            const node = audioContext.createBufferSource();
            node.buffer = r;
            node.connect(audioContext.destination);
            node.start();
          }}
        />
      ))}
    </SafeAreaView>
  );
}
