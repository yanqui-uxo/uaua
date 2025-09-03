import { useThereminSourceStore } from "@/global/state";
import { genericAudioContext } from "@/global/util";
import { Button, FlatList } from "react-native";
import { OscillatorType } from "react-native-audio-api";
import SourceView from "./SourceView";

import { sampleFilesData } from "@/global/state";

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

  async function loadSamples() {
    console.log("hello");
    setSources(sources.filter((s) => s.type !== "sample" || !s.file?.reload));

    for (const { name, uri } of await sampleFilesData()) {
      if (sources.some((s) => s.type === "sample" && s.file?.name === name)) {
        continue;
      }

      try {
        const buf = await genericAudioContext.decodeAudioDataSource(uri);
        console.log(buf);
        addSource({
          type: "sample",
          sample: buf,
          file: { name, uri, reload: true },
        });
      } catch (e) {
        // TODO: proper error handling
        console.error(`Error loading from URI ${uri} (${e})`);
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
          />
        )}
        keyExtractor={(item) => item.id}
      />
      <Button title="Reload samples" onPress={loadSamples} />
      {oscillatorTypes.map((ot) => (
        <Button
          title={`New ${ot}`}
          onPress={() => {
            addSource({ type: "tone", oscillatorType: ot });
          }}
          key={ot}
        />
      ))}
    </>
  );
}
