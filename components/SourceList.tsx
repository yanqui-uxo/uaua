import { useThereminSourceStore } from "@/global";
import { FlatList } from "react-native";
import SourceView from "./SourceView";

// TODO: add way to add sources
export default function SourceList() {
  const sources = useThereminSourceStore((state) => state.sources);
  const setIndex = useThereminSourceStore((state) => state.setIndex);

  return (
    <FlatList
      data={sources}
      renderItem={({ item, index }) => (
        <SourceView
          source={item}
          onChange={(s) => {
            setIndex(index, s);
          }}
          key={item.id}
        />
      )}
    />
  );
}
