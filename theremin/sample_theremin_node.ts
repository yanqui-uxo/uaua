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

  handleCoord({ x, y, width, height }: Coord, contextTime: number) {
    this.bufferNode.detune.setValueAtTime((x - width / 2) * 5, contextTime);
    this.gainNode.gain.setValueAtTime((height - y) / height, contextTime);
  }

  connect(destination: AudioDestinationNode) {
    this.gainNode.connect(destination);
  }
  disconnect() {
    this.gainNode.disconnect();
  }
  start(contextTime: number, offset?: number) {
    this.bufferNode.start(contextTime, offset);
  }
  stop(contextTime: number) {
    this.bufferNode.stop(contextTime);
  }
}
