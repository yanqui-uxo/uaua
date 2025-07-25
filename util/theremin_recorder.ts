import {
  AudioBuffer,
  AudioContext,
  BaseAudioContext,
  OfflineAudioContext,
} from "react-native-audio-api";
import RecordingIdentifier from "./recording_identifier";
import ThereminNode, { Coord } from "./theremin_node";

export type RecordingStep = { coord: Coord; time: number };
export type Recording = { steps: RecordingStep[]; stopTime: number };

export type ThereminNodeConstructor<Params extends unknown[]> = new (
  audioContext: BaseAudioContext,
  ...args: Params
) => ThereminNode;

export default class ThereminRecorder<NodeParams extends unknown[]> {
  private audioContext: AudioContext;
  private nodeConstructor: ThereminNodeConstructor<NodeParams>;

  private recordingStartTime: number | null = null;
  private recordingSteps: Map<
    RecordingIdentifier<NodeParams>,
    RecordingStep[]
  > = new Map();
  private recordings: Map<RecordingIdentifier<NodeParams>, Recording> =
    new Map();

  private get currentRecordingTime(): number | null {
    if (this.recordingStartTime === null) {
      return null;
    }

    return this.audioContext.currentTime - this.recordingStartTime;
  }

  constructor(
    audioContext: AudioContext,
    nodeConstructor: ThereminNodeConstructor<NodeParams>
  ) {
    this.audioContext = audioContext;
    this.nodeConstructor = nodeConstructor;
  }

  addStep(id: RecordingIdentifier<NodeParams>, coord: Coord) {
    if (this.recordingStartTime === null) {
      return;
    }

    if (!this.recordingSteps.has(id)) {
      this.recordingSteps.set(id, []);
    }
    const steps = this.recordingSteps.get(id)!;

    steps.push({
      coord,
      time: this.currentRecordingTime!,
    });
  }

  stopRecordingId(id: RecordingIdentifier<NodeParams>) {
    if (!this.currentRecordingTime) {
      return;
    }

    const steps = this.recordingSteps.get(id);
    if (!steps) {
      return;
    }
    this.recordingSteps.delete(id);

    this.recordings.set(id, { steps, stopTime: this.currentRecordingTime });
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

    for (const [id, recording] of this.recordings.entries()) {
      const node = new this.nodeConstructor(
        offlineAudioContext,
        ...id.nodeParams
      );

      console.log(recording);

      for (const step of recording.steps) {
        node.handleCoord(step.coord, step.time);
      }

      node.start(recording.steps[0].time);
      node.stop(recording.stopTime);
      node.connect(offlineAudioContext.destination);
    }

    this.recordingStartTime = null;
    this.recordings = new Map();

    return offlineAudioContext.startRendering();
  }
}
