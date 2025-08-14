import { useThereminSourceStore } from "@/global";
import { Button, View } from "react-native";
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
      <View style={{ flex: 1 }}>
        {sources.map((s, i) => (
          <SourceView
            source={s}
            onChange={(s) => {
              setIndex(i, s);
            }}
            key={s.id}
          />
        ))}
      </View>
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
