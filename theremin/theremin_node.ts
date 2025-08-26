import { AudioDestinationNode } from "react-native-audio-api";

export type Coord = { x: number; y: number; width: number; height: number };

export default interface ThereminNode {
  handleCoord(coord: Coord, time: number): void;
  connect(destination: AudioDestinationNode): void;
  disconnect(): void;
  start(time: number, offset?: number): void;
  stop(time: number): void;
}
