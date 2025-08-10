import { AudioDestinationNode, BaseAudioContext } from "react-native-audio-api";
import ThereminNode, { Coord } from "./theremin_node";
import ThereminNodeIdentifier, {
  ThereminNodeMaker,
} from "./theremin_node_identifier";
import ThereminRecorder from "./theremin_recorder";

export default class ThereminRecorderNode implements ThereminNode {
  private audioContext: BaseAudioContext;
  private inner: ThereminNode;
  private recorder: ThereminRecorder;
  private id: ThereminNodeIdentifier;

  constructor(
    audioContext: BaseAudioContext,
    recorder: ThereminRecorder,
    makeNode: ThereminNodeMaker
  ) {
    this.audioContext = audioContext;
    this.recorder = recorder;
    this.inner = makeNode(audioContext);
    this.id = new ThereminNodeIdentifier(makeNode);
  }

  handleCoord(coord: Coord, contextTime: number) {
    this.recorder.addStep(this.id, coord);
    this.inner.handleCoord(coord, contextTime);
  }

  connect(destination: AudioDestinationNode) {
    this.inner.connect(destination);
  }

  disconnect() {
    this.recorder.stopNode(this.id);
    this.inner.disconnect();
  }

  start() {
    this.inner.start(this.audioContext.currentTime);
  }

  stop() {
    this.recorder.stopNode(this.id);
    this.inner.stop(this.audioContext.currentTime);
  }

  clone(audioContext: BaseAudioContext) {
    return new ThereminRecorderNode(audioContext, this.recorder, this.id.make);
  }
}
