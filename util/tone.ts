import {
  AudioNode,
  AudioParam,
  BaseAudioContext,
  GainNode,
  OscillatorNode,
  OscillatorType,
} from "react-native-audio-api";

export default class Tone {
  #oscillatorNode: OscillatorNode;
  #gainNode: GainNode;

  constructor(audioContext: BaseAudioContext) {
    this.#oscillatorNode = audioContext.createOscillator();
    this.#gainNode = audioContext.createGain();
    this.#oscillatorNode.connect(this.#gainNode);
  }

  get frequency(): AudioParam {
    return this.#oscillatorNode.frequency;
  }

  get gain(): AudioParam {
    return this.#gainNode.gain;
  }

  set oscillatorType(oscillatorType: OscillatorType) {
    this.#oscillatorNode.type = oscillatorType;
  }

  connect(destination: AudioNode) {
    this.#gainNode.connect(destination);
  }

  disconnect() {
    this.#gainNode.disconnect();
  }

  start(time?: number) {
    this.#oscillatorNode.start(time);
  }

  stop(time?: number) {
    this.#oscillatorNode.stop(time);
  }
}
