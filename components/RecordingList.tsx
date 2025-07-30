import { useRecordingStore } from "@/global";
import { FlatList } from "react-native";
import RecordingView from "./RecordingView";
export default function RecordingsView() {
  const recordings = useRecordingStore((state) => state.recordings);
  return (
    <FlatList
      data={recordings}
      renderItem={({ item, index }) => (
        <RecordingView index={index} key={item.timestamp} />
      )}
    />
  );
}
