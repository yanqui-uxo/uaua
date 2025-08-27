import { AudioBuffer, OfflineAudioContext } from "react-native-audio-api";
import { Coord } from "./theremin_node";
import ThereminNodeIdentifier from "./theremin_node_identifier";

// absolute time is current unix timestamp in ms
export type ThereminStep = { coord: Coord; absoluteTime: number };
type ThereminRecording = { steps: ThereminStep[]; absoluteStopTime: number };
type MicRecording = { buffer: AudioBuffer; absoluteTime: number };

export default class ThereminRecorder {
  private absoluteRecordingStartTime: number | null = null;
  private steps: Map<ThereminNodeIdentifier, ThereminStep[]> = new Map();
  private thereminRecordings: Map<ThereminNodeIdentifier, ThereminRecording> =
    new Map();
  private micRecordings: MicRecording[] = [];

  addStep(id: ThereminNodeIdentifier, coord: Coord) {
    if (!this.steps.has(id)) {
      this.steps.set(id, []);
    }

    const step: ThereminStep = { coord, absoluteTime: Date.now() };
    if (this.absoluteRecordingStartTime) {
      this.steps.get(id)!.push(step);
    } else {
      this.steps.set(id, [step]);
    }
  }

  stopNode(id: ThereminNodeIdentifier) {
    if (this.absoluteRecordingStartTime === null) {
      this.steps.delete(id);
      return;
    }

    const steps = this.steps.get(id);
    if (!steps) {
      return;
    }
    this.steps.delete(id);

    this.thereminRecordings.set(id, {
      steps,
      absoluteStopTime: Date.now(),
    });
  }

  addMicRecording(recording: MicRecording) {
    if (this.absoluteRecordingStartTime) {
      this.micRecordings.push(recording);
    }
  }

  startRecording() {
    this.absoluteRecordingStartTime = Date.now();
  }

  async stopRecording(): Promise<AudioBuffer> {
    if (this.absoluteRecordingStartTime === null) {
      throw new Error("Cannot stop recording that has not been started");
    }

    for (const id of this.steps.keys()) {
      this.stopNode(id);
    }

    const absoluteToContextTime = (time: number) =>
      (time - this.absoluteRecordingStartTime!) / 1000;

    const sampleRate = 44100;
    const offlineAudioContext = new OfflineAudioContext({
      numberOfChannels: 2,
      length: absoluteToContextTime(Date.now()) * sampleRate,
      sampleRate,
    });

    for (const [id, recording] of this.thereminRecordings.entries()) {
      const node = id.make(offlineAudioContext);

      const startContextTime = absoluteToContextTime(
        recording.steps[0].absoluteTime
      );
      if (startContextTime > 0) {
        node.start(startContextTime);
      } else {
        node.start(Number.MIN_VALUE, -startContextTime);
      }

      for (const { coord, absoluteTime } of recording.steps) {
        node.handleCoord(
          coord,
          Math.max(absoluteToContextTime(absoluteTime), Number.MIN_VALUE)
        );
      }

      node.stop(absoluteToContextTime(recording.absoluteStopTime));
      node.connect(offlineAudioContext.destination);
    }

    for (const { buffer, absoluteTime } of this.micRecordings) {
      const time = absoluteToContextTime(absoluteTime);

      const node = offlineAudioContext.createBufferSource();
      node.buffer = buffer;

      if (time > 0) {
        node.start(time);
      } else {
        node.start(Number.MIN_VALUE, -time);
      }
    }

    this.absoluteRecordingStartTime = null;
    this.thereminRecordings = new Map();
    this.micRecordings = [];

    return offlineAudioContext.startRendering();
  }
}
