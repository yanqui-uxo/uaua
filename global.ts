import { randomUUID } from "expo-crypto";
import {
  AudioBuffer,
  AudioContext,
  OscillatorType,
} from "react-native-audio-api";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const audioContext = new AudioContext();

type ThereminSourceData =
  | { type: "sample"; sample: AudioBuffer }
  | { type: "oscillator"; oscillatorType: OscillatorType };
export type ThereminSource = ThereminSourceData & {
  selected: boolean;
  name?: string;
  id: string;
};

type ThereminSourceState = {
  sources: ThereminSource[];
  addSource: (s: ThereminSourceData) => void;
  removeSource: (index: number) => void;
  setIndex: (index: number, source: ThereminSource) => void;
};

export const useThereminSourceStore = create<ThereminSourceState>()(
  immer((set) => ({
    sources: [],
    addSource: (s: ThereminSourceData) =>
      set((state) => {
        state.sources.push({ ...s, selected: false, id: randomUUID() });
      }),
    removeSource: (index: number) =>
      set((state) => {
        state.sources.splice(index);
      }),
    setIndex: (index: number, source: ThereminSource) => {
      set((state) => {
        state.sources[index] = source;
      });
    },
  }))
);
