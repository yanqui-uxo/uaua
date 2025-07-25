import { AudioDestinationNode, BaseAudioContext } from "react-native-audio-api";
import RecordingIdentifier from "./recording_identifier";
import ThereminNode, { Coord } from "./theremin_node";
import ThereminRecorder, { ThereminNodeConstructor } from "./theremin_recorder";

export default class ThereminRecorderNode<
  NodeParams extends unknown[]
> extends ThereminNode {
  private inner: ThereminNode;
  private recorder: ThereminRecorder<NodeParams>;
  private id: RecordingIdentifier<NodeParams>;

  constructor(
    audioContext: BaseAudioContext,
    recorder: ThereminRecorder<NodeParams>,
    nodeConstructor: ThereminNodeConstructor<NodeParams>,
    ...args: NodeParams
  ) {
    super(audioContext);
    this.inner = new nodeConstructor(audioContext, ...args);
    this.recorder = recorder;
    this.id = new RecordingIdentifier(args);
  }

  handleCoord(coord: Coord) {
    this.recorder.addStep(this.id, coord);
    this.inner.handleCoord(coord, this.audioContext.currentTime);
  }

  connect(destination: AudioDestinationNode) {
    this.inner.connect(destination);
  }

  disconnect() {
    this.recorder.stopRecordingId(this.id);
    this.inner.disconnect();
  }

  start() {
    this.inner.start(this.audioContext.currentTime);
  }

  stop() {
    this.recorder.stopRecordingId(this.id);
    this.inner.stop(this.audioContext.currentTime);
  }
}
