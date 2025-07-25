import {
  AudioDestinationNode,
  BaseAudioContext,
  GainNode,
  OscillatorNode,
  OscillatorType,
} from "react-native-audio-api";
import ThereminNode, { Coord } from "./theremin_node";

export default class ToneThereminNode extends ThereminNode {
  private oscillatorNode: OscillatorNode;
  private gainNode: GainNode;

  constructor(audioContext: BaseAudioContext, oscillatorType: OscillatorType) {
    super(audioContext);
    this.oscillatorNode = audioContext.createOscillator();
    this.oscillatorNode.type = oscillatorType;
    this.gainNode = audioContext.createGain();
    this.oscillatorNode.connect(this.gainNode);
  }

  handleCoord({ x, y, height }: Coord, time: number) {
    this.oscillatorNode.frequency.setValueAtTime(x, time);
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
