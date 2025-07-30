import { BaseAudioContext } from "react-native-audio-api";
import ThereminNode from "./theremin_node";

export type ThereminNodeMaker = (
  audioContext: BaseAudioContext
) => ThereminNode;

export default class ThereminNodeIdentifier {
  private _make: ThereminNodeMaker;

  get make(): ThereminNodeMaker {
    return this._make;
  }

  constructor(make: ThereminNodeMaker) {
    this._make = make;
  }
}
