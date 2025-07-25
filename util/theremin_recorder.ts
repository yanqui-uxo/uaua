import {
  AudioBuffer,
  AudioContext,
  OfflineAudioContext,
} from "react-native-audio-api";
import { Coord } from "./theremin_node";
import ThereminNodeIdentifier from "./theremin_node_identifier";

export type Step = { coord: Coord; time: number };
export type Recording = { steps: Step[]; stopTime: number };

export default class ThereminRecorder {
  private audioContext: AudioContext;

  private recordingStartTime: number | null = null;
  private steps: Map<ThereminNodeIdentifier, Step[]> = new Map();
  private recordings: Map<ThereminNodeIdentifier, Recording> = new Map();

  private get currentRecordingTime(): number | null {
    if (this.recordingStartTime === null) {
      return null;
    }

    return this.audioContext.currentTime - this.recordingStartTime;
  }

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }

  addNode(id: ThereminNodeIdentifier, steps: Step[]) {
    this.steps.set(id, steps);
  }

  stopNode(id: ThereminNodeIdentifier) {
    if (!this.currentRecordingTime) {
      this.steps.delete(id);
      return;
    }

    const steps = this.steps.get(id);
    if (!steps) {
      return;
    }
    this.steps.delete(id);

    this.recordings.set(id, {
      steps: steps.map((s) => ({
        coord: s.coord,
        time: s.time - this.recordingStartTime!,
      })),
      stopTime: this.currentRecordingTime,
    });
  }

  startRecording() {
    this.recordingStartTime = this.audioContext.currentTime;
  }

  stopRecording(): Promise<AudioBuffer> {
    if (this.currentRecordingTime === null) {
      throw new Error("Cannot stop recording that has not been started");
    }
    const sampleRate = 44100;
    const offlineAudioContext = new OfflineAudioContext({
      numberOfChannels: 2,
      length: this.currentRecordingTime * sampleRate,
      sampleRate,
    });

    for (const [template, recording] of this.recordings.entries()) {
      const node = template.make(offlineAudioContext);

      const startTime = recording.steps[0].time;

      if (startTime < 0) {
        node.start(0, -startTime);
      } else {
        node.start(startTime);
      }

      for (const { coord, time } of recording.steps) {
        node.handleCoord(coord, time);
      }

      node.stop(recording.stopTime);
      node.connect(offlineAudioContext.destination);
    }

    this.recordingStartTime = null;
    this.recordings = new Map();

    return offlineAudioContext.startRendering();
  }
}
