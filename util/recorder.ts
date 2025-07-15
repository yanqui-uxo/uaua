import {
  AudioBuffer,
  AudioContext,
  OfflineAudioContext,
  OscillatorType,
} from "react-native-audio-api";
import Tone from "./tone";

type ToneRecordingStep = {
  time: number;
  frequency: number;
  gain: number;
};
type ToneRecording = {
  steps: ToneRecordingStep[];
  stopTime: number;
  oscillatorType: OscillatorType;
};

export class Recorder {
  #audioContext: AudioContext;
  #recordingStartTime: number | null = null;
  #toneRecordings: Map<number, ToneRecording[]> = new Map();
  #toneRecordingSteps: Map<number, ToneRecordingStep[]> = new Map();

  constructor(audioContext: AudioContext) {
    this.#audioContext = audioContext;
  }

  get currentRecordingTime(): number | null {
    if (this.#recordingStartTime === null) {
      return null;
    }

    return this.#audioContext.currentTime - this.#recordingStartTime;
  }

  startRecording() {
    this.#recordingStartTime = this.#audioContext.currentTime;
  }

  addStep(id: number, frequency: number, gain: number) {
    if (!this.currentRecordingTime) {
      return;
    }

    if (!this.#toneRecordingSteps.has(id)) {
      this.#toneRecordingSteps.set(id, []);
    }
    this.#toneRecordingSteps
      .get(id)!
      .push({ frequency, gain, time: this.currentRecordingTime });
  }

  stopTone(id: number, oscillatorType: OscillatorType) {
    if (!this.currentRecordingTime) {
      return;
    }

    const steps = this.#toneRecordingSteps.get(id);
    if (!steps) {
      return;
    }
    this.#toneRecordingSteps.delete(id);

    if (!this.#toneRecordings.has(id)) {
      this.#toneRecordings.set(id, []);
    }
    this.#toneRecordings.get(id)!.push({
      steps,
      stopTime: this.currentRecordingTime,
      oscillatorType,
    });
  }

  stopRecording(): Promise<AudioBuffer> {
    if (!this.currentRecordingTime) {
      throw new Error("Cannot stop recording that has not been started");
    }

    const sampleRate = 44100;
    const offlineAudioContext = new OfflineAudioContext({
      numberOfChannels: 2,
      sampleRate,
      length: sampleRate * this.currentRecordingTime,
    });

    for (const toneRecording of [...this.#toneRecordings.values()].flat()) {
      const tone = new Tone(offlineAudioContext);
      tone.connect(offlineAudioContext.destination);
      tone.oscillatorType = toneRecording.oscillatorType;
      tone.start(toneRecording.steps[0].time);
      tone.stop(toneRecording.stopTime);

      for (const { frequency, gain, time } of toneRecording.steps) {
        tone.frequency.setValueAtTime(frequency, time);
        tone.gain.setValueAtTime(gain, time);
      }
    }

    this.#toneRecordingSteps = new Map();
    this.#toneRecordings = new Map();
    this.#recordingStartTime = null;

    return offlineAudioContext.startRendering();
  }
}
