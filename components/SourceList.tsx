import { genericAudioContext } from "@/global/audio_util";
import { useThereminSourceStore } from "@/global/state";
import { randomUUID } from "expo-crypto";
import { File, Paths } from "expo-file-system";
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
  const setSources = useThereminSourceStore((state) => state.setSources);
  const setIndex = useThereminSourceStore((state) => state.setIndex);
  const removeSource = useThereminSourceStore((state) => state.removeSource);

  async function loadSamples() {
    const files = Paths.document.list().filter((x) => x instanceof File);

    setSources(sources.filter((s) => s.type !== "sample"));

    for (const file of files) {
      try {
        const buf = await genericAudioContext.decodeAudioDataSource(file.uri);
        addSource(
          {
            type: "sample",
            sample: buf,
          },
          file.name.replace(/\.[^.]*$/, "")
        );
      } catch (e) {
        // TODO: proper error handling
        console.warn(`Error loading from URI ${file.uri} (${e})`);
      }
    }
  }

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
            remove={() => {
              removeSource(index);
            }}
          />
        )}
        keyExtractor={(item) => item.id}
      />
      <Button title="Reload samples" onPress={loadSamples} />
      {oscillatorTypes.map((ot) => (
        <Button
          title={`New ${ot}`}
          onPress={() => {
            addSource({ type: "tone", oscillatorType: ot }, randomUUID());
          }}
          key={ot}
        />
      ))}
    </>
  );
}
