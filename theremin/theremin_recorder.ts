import { genericAudioContext, sampleRate } from "@/global/util";
import {
  AudioBuffer,
  AudioManager,
  AudioRecorder,
  OfflineAudioContext,
} from "react-native-audio-api";
import { Coord } from "./theremin_node";
import ThereminNodeIdentifier from "./theremin_node_identifier";

AudioManager.setAudioSessionOptions({
  iosCategory: "playAndRecord",
  iosMode: "spokenAudio",
  iosOptions: ["defaultToSpeaker", "allowBluetoothA2DP"],
});

AudioManager.requestRecordingPermissions();

// absolute time is current unix timestamp in ms
export type ThereminStep = { coord: Coord; absoluteTime: number };
type ThereminRecording = { steps: ThereminStep[]; absoluteStopTime: number };
type MicSession = { buffers: AudioBuffer[]; absoluteStartTime: number };

function concatenateAudioBuffers(buffers: AudioBuffer[]): AudioBuffer {
  const concatLength = buffers.map((b) => b.length).reduce((acc, l) => acc + l);

  const newBuffer = genericAudioContext.createBuffer(
    buffers[0].numberOfChannels,
    concatLength,
    buffers[0].sampleRate
  );

  for (let i = 0; i < buffers[0].numberOfChannels; i++) {
    const iterator = (function* () {
      for (const buffer of buffers) {
        yield* buffer.getChannelData(i);
      }
    })();

    // HACK: seems to return only zeroes if provided iterator directly
    newBuffer.copyToChannel(new Float32Array([...iterator]), i);
  }

  return newBuffer;
}

export default class ThereminRecorder {
  private absoluteRecordingStartTime: number | null = null;
  private steps: Map<ThereminNodeIdentifier, ThereminStep[]> = new Map();
  private thereminRecordings: Map<ThereminNodeIdentifier, ThereminRecording> =
    new Map();

  private currentMicSession: MicSession | null = null;
  private micSessions: MicSession[] = [];
  private micRecorder: AudioRecorder = (() => {
    const recorder = new AudioRecorder({
      sampleRate,
      bufferLengthInSamples: Math.round(sampleRate / 100),
    });
    recorder.onAudioReady((e) => {
      if (!this.absoluteRecordingStartTime) {
        return;
      }

      if (!this.currentMicSession) {
        this.currentMicSession = {
          buffers: [],
          absoluteStartTime: Date.now() - e.buffer.duration * 1000,
        };
      }

      this.currentMicSession.buffers.push(e.buffer);
    });
    return recorder;
  })();

  addStep(id: ThereminNodeIdentifier, coord: Coord) {
    const step: ThereminStep = { coord, absoluteTime: Date.now() };
    if (this.absoluteRecordingStartTime && this.steps.has(id)) {
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

  async startMic(): Promise<boolean> {
    if ((await AudioManager.checkRecordingPermissions()) !== "Granted") {
      return false;
    }
    this.micRecorder.start();
    return true;
  }

  private cleanMicSessions() {
    if (!this.currentMicSession) {
      return;
    }

    this.micSessions.push(this.currentMicSession);
    this.currentMicSession = null;
  }

  stopMic() {
    this.micRecorder.stop();
    this.cleanMicSessions();
  }

  startRecording() {
    this.absoluteRecordingStartTime = Date.now();
  }

  async stopRecording(): Promise<AudioBuffer> {
    if (this.absoluteRecordingStartTime === null) {
      throw new Error("Cannot stop recording that has not been started");
    }

    this.cleanMicSessions();

    for (const id of this.steps.keys()) {
      this.stopNode(id);
    }

    const absoluteToContextTime = (time: number) =>
      (time - this.absoluteRecordingStartTime!) / 1000;

    const offlineAudioContext = new OfflineAudioContext({
      numberOfChannels: 2,
      length: Math.ceil(absoluteToContextTime(Date.now()) * sampleRate),
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

    for (const { buffers, absoluteStartTime } of this.micSessions) {
      const time = absoluteToContextTime(absoluteStartTime);

      const node = offlineAudioContext.createBufferSource();
      node.buffer = concatenateAudioBuffers(buffers);
      node.connect(offlineAudioContext.destination);

      if (time > 0) {
        node.start(time);
      } else {
        node.start(Number.MIN_VALUE, -time);
      }
    }

    this.absoluteRecordingStartTime = null;
    this.thereminRecordings = new Map();
    this.micSessions = [];

    return offlineAudioContext.startRendering();
  }
}
