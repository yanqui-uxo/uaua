import { AudioDestinationNode, BaseAudioContext } from "react-native-audio-api";
import ThereminNode, { Coord } from "./theremin_node";
import ThereminNodeIdentifier, {
  ThereminNodeMaker,
} from "./theremin_node_identifier";
import ThereminRecorder, { Step } from "./theremin_recorder";

export default class ThereminRecorderNode extends ThereminNode {
  private inner: ThereminNode;
  private recorder: ThereminRecorder;
  private identifier: ThereminNodeIdentifier;
  private steps: Step[] = [];

  constructor(
    audioContext: BaseAudioContext,
    recorder: ThereminRecorder,
    makeNode: ThereminNodeMaker
  ) {
    super(audioContext);
    this.recorder = recorder;
    this.inner = makeNode(audioContext);
    this.identifier = new ThereminNodeIdentifier(makeNode);
    this.recorder.addNode(this.identifier, this.steps);
  }

  handleCoord(coord: Coord) {
    this.steps.push({ coord, time: this.audioContext.currentTime });
    this.inner.handleCoord(coord, this.audioContext.currentTime);
  }

  connect(destination: AudioDestinationNode) {
    this.inner.connect(destination);
  }

  disconnect() {
    this.recorder.stopNode(this.identifier);
    this.inner.disconnect();
  }

  start() {
    this.inner.start(this.audioContext.currentTime);
  }

  stop() {
    this.recorder.stopNode(this.identifier);
    this.inner.stop(this.audioContext.currentTime);
  }

  clone(audioContext: BaseAudioContext) {
    return new ThereminRecorderNode(
      audioContext,
      this.recorder,
      this.identifier.make
    );
  }
}
