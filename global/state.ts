import { randomUUID } from "expo-crypto";
import { Directory, File, Paths } from "expo-file-system";
import { AudioBuffer, OscillatorType } from "react-native-audio-api";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type SampleFileData = { name: string; uri: string };
type SampleSourceData = {
  type: "sample";
  sample: AudioBuffer;
  file?: SampleFileData & { reload: boolean };
};
type ThereminSourceData =
  | SampleSourceData
  | { type: "tone"; oscillatorType: OscillatorType };
export type ThereminSource = ThereminSourceData & {
  selected: boolean;
  id: string;
};

type ThereminSourceState = {
  sources: ThereminSource[];
  addSource: (s: ThereminSourceData) => void;
  removeSource: (index: number) => void;
  setSources: (s: ThereminSource[]) => void;
  setIndex: (index: number, source: ThereminSource) => void;
};

export function sampleFilesData(): SampleFileData[] {
  const data: SampleFileData[] = [];

  async function iterateDirectory(directory: Directory) {
    for (const content of directory.list()) {
      if (content instanceof File) {
        if (!content.exists) {
          return;
        }
        data.push({ name: content.name, uri: content.uri });
      } else if (content instanceof Directory) {
        await iterateDirectory(content);
      }
    }
  }

  iterateDirectory(Paths.document);
  return data;
}

export const useThereminSourceStore = create<ThereminSourceState>()(
  immer((set) => ({
    sources: [],
    addSource: (s: ThereminSourceData) => {
      set((state) => {
        state.sources.push({ ...s, selected: true, id: randomUUID() });
      });
    },
    removeSource: (index: number) => {
      set((state) => {
        state.sources.splice(index);
      });
    },
    setSources: (s: ThereminSource[]) => {
      set((state) => {
        state.sources = s;
      });
    },
    setIndex: (index: number, source: ThereminSource) => {
      set((state) => {
        state.sources[index] = source;
      });
    },
  }))
);
