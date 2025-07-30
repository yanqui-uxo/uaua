import { AudioContext } from "react-native-audio-api";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Recording } from "./theremin/theremin_recorder";

export const audioContext = new AudioContext();

type RecordingState = {
  recordings: Recording[];
  addRecording: (r: Recording) => void;
  setName: (index: number, name: string) => void;
};

export const useRecordingStore = create<RecordingState>()(
  immer((set) => ({
    recordings: [],
    addRecording: (r: Recording) =>
      set((state) => {
        state.recordings.push(r);
      }),
    setName: (index: number, name: string) =>
      set((state) => {
        state.recordings[index].name = name;
      }),
  }))
);
