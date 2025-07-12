import { useRef, useState } from "react";
import {
  Gesture,
  GestureDetector,
  GestureTouchEvent,
  TouchData,
} from "react-native-gesture-handler";
import {
  AudioContext,
  AudioNode,
  AudioParam,
  BaseAudioContext,
  GainNode,
  OscillatorNode,
} from "react-native-audio-api";
import { StyleSheet } from "react-native";
import { Canvas, Circle } from "@shopify/react-native-skia";

class Tone {
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

export default function Theremin() {
  const audioContextRef = useRef<AudioContext>(new AudioContext());

  const [touches, setTouches] = useState<TouchData[]>([]);
  const widthRef = useRef<number | null>(null);
  const heightRef = useRef<number | null>(null);
  const tonesRef = useRef<Map<number, Tone>>(new Map());

  function onTouchRemove(e: GestureTouchEvent) {
    const changedIds = e.changedTouches.map((t) => t.id);

    // for some reason allTouches can contain a touch that was just removed
    const confirmedTouches = e.allTouches.filter(
      (t) => !changedIds.includes(t.id)
    );
    setTouches(confirmedTouches);

    const confirmedIds = confirmedTouches.map((t) => t.id);
    for (const [id, tone] of tonesRef.current) {
      if (!confirmedIds.includes(id)) {
        tone.disconnect();
      }
    }
  }

  function xToFrequency(x: number): number {
    return x * 1.5;
  }
  function yToGain(y: number): number {
    const height = heightRef.current!;
    return (height - y) / height;
  }

  const gesture = Gesture.Pan()
    .onTouchesDown((e) => {
      setTouches(e.allTouches);
      for (const t of e.changedTouches) {
        const oldTone = tonesRef.current.get(t.id);
        if (oldTone) {
          oldTone.disconnect();
        }

        const tone = new Tone(audioContextRef.current);
        tonesRef.current.set(t.id, tone);
        tone.frequency.value = xToFrequency(t.x);
        tone.gain.value = yToGain(t.y);
        tone.connect(audioContextRef.current.destination);
        tone.start();
      }
    })
    .onTouchesMove((e) => {
      setTouches(e.allTouches);

      for (const touch of e.changedTouches) {
        const tone = tonesRef.current.get(touch.id);
        if (tone) {
          tone.frequency.value = xToFrequency(touch.x);
          tone.gain.value = yToGain(touch.y);
        }
      }
    })
    .onTouchesUp(onTouchRemove)
    .onTouchesCancelled(onTouchRemove)
    .runOnJS(true);

  return (
    <GestureDetector gesture={gesture}>
      <Canvas
        style={styles.canvas}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          widthRef.current = width;
          heightRef.current = height;
        }}
      >
        {touches.map((t) => (
          <Circle cx={t.x} cy={t.y} r={50} key={t.id}></Circle>
        ))}
      </Canvas>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    backgroundColor: "skyblue",
  },
});
