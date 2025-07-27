import { AudioDestinationNode, BaseAudioContext } from "react-native-audio-api";

export type Coord = { x: number; y: number; width: number; height: number };

export default abstract class ThereminNode {
  protected audioContext: BaseAudioContext;

  constructor(audioContext: BaseAudioContext) {
    this.audioContext = audioContext;
  }

  abstract handleCoord(coord: Coord, time: number): void;
  abstract connect(destination: AudioDestinationNode): void;
  abstract disconnect(): void;
  abstract start(when: number, offset?: number): void;
  abstract stop(time: number): void;
  abstract clone(audioContext: BaseAudioContext): ThereminNode;
}
