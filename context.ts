import { createContext } from "react";
import { AudioBuffer, AudioContext } from "react-native-audio-api";

export const audioContext = new AudioContext();
export const RecordingsContext = createContext<{
  recordings: AudioBuffer[];
  setRecordings: (b: AudioBuffer[]) => void;
}>(undefined!);
