import {
  AudioBuffer,
  AudioBufferSourceNode,
  AudioDestinationNode,
  BaseAudioContext,
  GainNode,
} from "react-native-audio-api";
import ThereminNode, { Coord } from "./theremin_node";

export default class SampleThereminNode implements ThereminNode {
  private bufferNode: AudioBufferSourceNode;
  private gainNode: GainNode;

  constructor(audioContext: BaseAudioContext, sample: AudioBuffer) {
    this.bufferNode = audioContext.createBufferSource();
    this.bufferNode.buffer = sample;
    this.bufferNode.loop = true;
    this.gainNode = audioContext.createGain();
    this.bufferNode.connect(this.gainNode);
  }

  handleCoord({ x, width }: Coord, time: number) {
    this.bufferNode.detune.setValueAtTime((x - width / 2) * 5, time);
  }

  connect(destination: AudioDestinationNode) {
    this.gainNode.connect(destination);
  }
  disconnect() {
    this.gainNode.disconnect();
  }
  start(when: number, offset?: number) {
    this.bufferNode.start(when, offset);
  }
  stop(time: number) {
    this.bufferNode.stop(time);
  }
  clone(audioContext: BaseAudioContext): SampleThereminNode {
    return new SampleThereminNode(audioContext, this.bufferNode.buffer!);
  }
}
