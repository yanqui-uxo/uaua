import { useRef, useState } from "react";
import {
  Gesture,
  GestureDetector,
  GestureStateManager,
  GestureTouchEvent,
  TouchData,
} from "react-native-gesture-handler";
import { AudioContext, GainNode, OscillatorNode } from "react-native-audio-api";
import { Button, StyleSheet } from "react-native";
import { runOnUI } from "react-native-reanimated";
import { Canvas, Circle } from "@shopify/react-native-skia";

type Tone = { oscillator: OscillatorNode; gainNode: GainNode };

// TODO: use Pressable instead of GestureDetector
export default function Theremin() {
  const audioContextRef = useRef<AudioContext>(new AudioContext());

  const [touches, setTouches] = useState<TouchData[]>([]);
  const widthRef = useRef<number | null>(null);
  const heightRef = useRef<number | null>(null);
  const tones = useRef<Record<number, Tone>>({});

  function onTouchRemove(e: GestureTouchEvent, manager: GestureStateManager) {
    e.changedTouches.forEach((t) => {
      const { oscillator, gainNode } = tones.current[t.id];
      gainNode.disconnect();
      oscillator.disconnect();
      delete tones.current[t.id];
    });
    if (e.numberOfTouches === 0) {
      runOnUI(() => manager.end())();
      setTouches([]);
    } else {
      setTouches(e.allTouches);
    }
  }

  function xToFrequency(x: number): number {
    return x * 2;
  }
  function yToGain(y: number): number {
    const height = heightRef.current!;
    return (height - y) / height;
  }

  const gesture = Gesture.Manual()
    .onTouchesDown((e, manager) => {
      runOnUI(() => manager.activate())();
      setTouches(e.allTouches);
      e.changedTouches.forEach((t) => {
        const oscillator = audioContextRef.current.createOscillator();
        oscillator.frequency.setValueAtTime(
          xToFrequency(t.x),
          audioContextRef.current.currentTime
        );
        const gainNode = audioContextRef.current.createGain();
        gainNode.gain.setValueAtTime(
          yToGain(t.y),
          audioContextRef.current.currentTime
        );
        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);
        oscillator.start();
        tones.current[t.id] = { oscillator, gainNode };
      });
    })
    .onTouchesMove((e) => {
      setTouches(e.allTouches);

      e.changedTouches.forEach((t) => {
        const { oscillator, gainNode } = tones.current[t.id];
        oscillator.frequency.setValueAtTime(
          xToFrequency(t.x),
          audioContextRef.current.currentTime
        );
        gainNode.gain.setValueAtTime(
          yToGain(t.y),
          audioContextRef.current.currentTime
        );
      });
    })
    .onTouchesUp(onTouchRemove)
    .onTouchesCancelled(onTouchRemove)
    .runOnJS(true);

  return (
    <>
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
      <Button
        title="SILENCE"
        onPress={() => {
          audioContextRef.current.close();
          audioContextRef.current = new AudioContext();
          tones.current = {};
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    backgroundColor: "skyblue",
    height: 1000,
    flexBasis: 500,
  },
  container: {
    flex: 1,
    alignItems: "center",
  },
});
