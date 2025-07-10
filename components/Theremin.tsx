import { useRef, useState } from "react";
import {
  Gesture,
  GestureDetector,
  GestureStateManager,
  GestureTouchEvent,
  TouchData,
} from "react-native-gesture-handler";
import { AudioContext, GainNode, OscillatorNode } from "react-native-audio-api";
import { StyleSheet } from "react-native";
import { Canvas, Circle } from "@shopify/react-native-skia";

type Tone = { oscillator: OscillatorNode; gainNode: GainNode };

export default function Theremin() {
  const audioContextRef = useRef<AudioContext>(new AudioContext());

  const [touches, setTouches] = useState<TouchData[]>([]);
  const widthRef = useRef<number | null>(null);
  const heightRef = useRef<number | null>(null);
  const tonesRef = useRef<Map<number, Tone>>(new Map());

  function onTouchRemove(e: GestureTouchEvent, manager: GestureStateManager) {
    const changedIds = e.changedTouches.map((t) => t.id);
    const confirmedTouches = e.allTouches.filter(
      (t) => !changedIds.includes(t.id)
    );
    setTouches(confirmedTouches);

    if (confirmedTouches.length === 0) {
      // sanity check
      tonesRef.current = new Map();
      audioContextRef.current.close();
      audioContextRef.current = new AudioContext();
    } else {
      const confirmedIds = confirmedTouches.map((t) => t.id);
      [...tonesRef.current.entries()]
        .filter(([id, _]) => !confirmedIds.includes(id))
        .forEach(([id, tone]) => {
          tone.gainNode.disconnect();
          tone.oscillator.disconnect();
          tonesRef.current.delete(id);
        });
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
    .onTouchesDown((e, manager) => {
      setTouches(e.allTouches);
      e.changedTouches.forEach((t) => {
        const oscillator = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();
        tonesRef.current.set(t.id, { oscillator, gainNode });
        oscillator.frequency.value = xToFrequency(t.x);
        gainNode.gain.value = yToGain(t.y);
        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);
        oscillator.start();
      });
    })
    .onTouchesMove((e) => {
      setTouches(e.allTouches);

      e.changedTouches.forEach((t) => {
        const { oscillator, gainNode } = tonesRef.current.get(t.id)!;
        oscillator.frequency.value = xToFrequency(t.x);
        gainNode.gain.value = yToGain(t.y);
      });
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
