import {
  AudioBuffer,
  AudioBufferSourceNode,
  AudioDestinationNode,
  BaseAudioContext,
} from "react-native-audio-api";
import ThereminNode, { Coord } from "./theremin_node";

export default class SampleThereminNode extends ThereminNode {
  private node: AudioBufferSourceNode;
  constructor(audioContext: BaseAudioContext, sample: AudioBuffer) {
    super(audioContext);
    this.node = audioContext.createBufferSource();
    this.node.buffer = sample;
    this.node.loop = true;
  }

  // TODO: add logic
  handleCoord(coord: Coord) {}

  connect(destination: AudioDestinationNode) {
    this.node.connect(destination);
  }
  disconnect() {
    this.node.disconnect();
  }
  start(when: number, offset?: number) {
    this.node.start(when, offset);
  }
  stop(time: number) {
    this.node.stop(time);
  }
  clone(audioContext: BaseAudioContext): SampleThereminNode {
    return new SampleThereminNode(audioContext, this.node.buffer!);
  }
}
