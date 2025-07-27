import { RecordingsContext } from "@/context";
import { Tabs } from "expo-router";
import { useState } from "react";
import { AudioBuffer } from "react-native-audio-api";

export default function Layout() {
  const [recordings, setRecordings] = useState<AudioBuffer[]>([]);

  return (
    <RecordingsContext value={{ recordings, setRecordings }}>
      <Tabs>
        <Tabs.Screen name="index" options={{ title: "Main" }} />
        <Tabs.Screen name="recordings" options={{ title: "Recordings" }} />
      </Tabs>
    </RecordingsContext>
  );
}
