import {
  AudioDestinationNode,
  BaseAudioContext,
  GainNode,
  OscillatorNode,
  OscillatorType,
} from "react-native-audio-api";
import ThereminNode, { Coord } from "./theremin_node";

export default class ToneThereminNode implements ThereminNode {
  private oscillatorType: OscillatorType;
  private oscillatorNode: OscillatorNode;
  private gainNode: GainNode;

  constructor(audioContext: BaseAudioContext, oscillatorType: OscillatorType) {
    this.oscillatorNode = audioContext.createOscillator();
    this.oscillatorType = oscillatorType;
    this.oscillatorNode.type = this.oscillatorType;
    this.gainNode = audioContext.createGain();
    this.oscillatorNode.connect(this.gainNode);
  }

  handleCoord({ x, y, height }: Coord, time: number) {
    this.oscillatorNode.frequency.setValueAtTime(x * 2, time);
    this.gainNode.gain.setValueAtTime((height - y) / height, time);
  }

  connect(destination: AudioDestinationNode) {
    this.gainNode.connect(destination);
  }

  disconnect() {
    this.gainNode.disconnect();
  }

  start(time: number) {
    this.oscillatorNode.start(time);
  }

  stop(time: number) {
    this.oscillatorNode.stop(time);
  }
}
