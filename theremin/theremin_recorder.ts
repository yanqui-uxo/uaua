import { AudioBuffer, OfflineAudioContext } from "react-native-audio-api";
import { Coord } from "./theremin_node";
import ThereminNodeIdentifier from "./theremin_node_identifier";

export type Step = { coord: Coord; time: number };
type Recording = { steps: Step[]; stopTime: number };

export default class ThereminRecorder {
  private recordingStartTime: number | null = null;
  private steps: Map<ThereminNodeIdentifier, Step[]> = new Map();
  private recordings: Map<ThereminNodeIdentifier, Recording> = new Map();

  addStep(id: ThereminNodeIdentifier, coord: Coord) {
    if (!this.steps.has(id)) {
      this.steps.set(id, []);
    }
    this.steps.get(id)!.push({ coord, time: Date.now() });
  }

  stopNode(id: ThereminNodeIdentifier) {
    if (this.recordingStartTime === null) {
      this.steps.delete(id);
      return;
    }

    const steps = this.steps.get(id);
    if (!steps) {
      return;
    }
    this.steps.delete(id);

    this.recordings.set(id, {
      steps,
      stopTime: Date.now(),
    });
  }

  startRecording() {
    this.recordingStartTime = Date.now();
  }

  async stopRecording(): Promise<AudioBuffer> {
    if (this.recordingStartTime === null) {
      throw new Error("Cannot stop recording that has not been started");
    }

    const absoluteToContextTime = (time: number) =>
      (time - this.recordingStartTime!) / 1000;

    const sampleRate = 44100;
    const offlineAudioContext = new OfflineAudioContext({
      numberOfChannels: 2,
      length: absoluteToContextTime(Date.now()) * sampleRate,
      sampleRate,
    });

    for (const [id, recording] of this.recordings.entries()) {
      const node = id.make(offlineAudioContext);

      const startContextTime = absoluteToContextTime(recording.steps[0].time);
      if (startContextTime >= 0) {
        node.start(startContextTime);
      } else {
        node.start(0, -startContextTime);
      }

      for (const { coord, time } of recording.steps) {
        node.handleCoord(coord, absoluteToContextTime(time));
      }

      node.stop(absoluteToContextTime(recording.stopTime));
      node.connect(offlineAudioContext.destination);
    }

    this.recordingStartTime = null;
    this.recordings = new Map();

    return offlineAudioContext.startRendering();
  }
}
