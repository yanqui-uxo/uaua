import { useThereminSourceStore } from "@/global";
import { Button, FlatList } from "react-native";
import { OscillatorType } from "react-native-audio-api";
import SourceView from "./SourceView";

const oscillatorTypes: OscillatorType[] = [
  "sine",
  "sawtooth",
  "triangle",
  "square",
];
export default function SourceList() {
  const sources = useThereminSourceStore((state) => state.sources);
  const addSource = useThereminSourceStore((state) => state.addSource);
  const setIndex = useThereminSourceStore((state) => state.setIndex);

  return (
    <>
      <FlatList
        style={{ flex: 1 }}
        data={sources}
        renderItem={({ item, index }) => (
          <SourceView
            source={item}
            onChange={(s) => {
              setIndex(index, s);
            }}
          />
        )}
        keyExtractor={(item) => item.id}
      />
      {oscillatorTypes.map((ot) => (
        <Button
          title={`New ${ot}`}
          onPress={() => {
            addSource({ type: "oscillator", oscillatorType: ot });
          }}
          key={ot}
        />
      ))}
    </>
  );
}
