import RecordingsView from "@/components/RecordingList";
import { SafeAreaView } from "react-native";

export default function Recordings() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <RecordingsView />
    </SafeAreaView>
  );
}
