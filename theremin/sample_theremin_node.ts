import { scale } from "@/global/util";
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

  handleCoord({ x, y, width, height }: Coord, time: number) {
    const detune = scale({ value: x, scaleEnd: width, min: -500, max: 500 });
    const gain = scale({ value: height - y, scaleEnd: height, min: 0, max: 1 });
    this.bufferNode.detune.linearRampToValueAtTime(detune, time);
    this.gainNode.gain.linearRampToValueAtTime(gain, time);
  }

  connect(destination: AudioDestinationNode) {
    this.gainNode.connect(destination);
  }
  disconnect() {
    this.gainNode.disconnect();
  }
  start(time: number, offset?: number) {
    this.bufferNode.start(time, offset);
  }
  stop(time: number) {
    this.bufferNode.stop(time);
  }
}
