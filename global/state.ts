import { AudioBuffer, OscillatorType } from "react-native-audio-api";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type ThereminSourceData =
  | { type: "sample"; sample: AudioBuffer }
  | { type: "tone"; oscillatorType: OscillatorType };
export type ThereminSource = ThereminSourceData & {
  name?: string;
  selected: boolean;
  id: string;
};

type ThereminSourceState = {
  sources: ThereminSource[];
  addSource: (s: ThereminSourceData, id: string) => void;
  removeSource: (index: number) => void;
  setSources: (s: ThereminSource[]) => void;
  setIndex: (index: number, source: ThereminSource) => void;
};

export const useThereminSourceStore = create<ThereminSourceState>()(
  immer((set) => ({
    sources: [],
    addSource: (s: ThereminSourceData, id: string) => {
      set((state) => {
        state.sources.push({ ...s, id, selected: true });
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
