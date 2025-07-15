import { useRef, useState } from "react";
import {
  Gesture,
  GestureDetector,
  GestureTouchEvent,
  TouchData,
} from "react-native-gesture-handler";
import { AudioContext, OscillatorType } from "react-native-audio-api";
import { StyleSheet } from "react-native";
import { Canvas, Circle } from "@shopify/react-native-skia";
import { Recorder } from "@/util/recorder";
import Tone from "@/util/tone";

// TODO: fix tone being held on six-finger tap on iOS
export default function Theremin({
  audioContext,
  oscillatorType,
  recorder,
}: {
  audioContext: AudioContext;
  oscillatorType: OscillatorType;
  recorder: Recorder;
}) {
  const [touches, setTouches] = useState<TouchData[]>([]);
  const widthRef = useRef<number | null>(null);
  const heightRef = useRef<number | null>(null);
  const tonesRef = useRef<Map<number, Tone>>(new Map());

  function onTouchRemove(e: GestureTouchEvent) {
    console.log(`remove`, e.changedTouches);
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
        recorder.stopTone(id, oscillatorType);
      }
    }
  }

  function xToFrequency(x: number): number {
    return x * 1.5;
  }
  function yToGain(y: number): number {
    const height = heightRef.current!;
    return ((height - y) / height) * 0.5;
  }

  const gesture = Gesture.Pan()
    .onTouchesDown((e) => {
      console.log(`add`, e.changedTouches);
      setTouches(e.allTouches);

      for (const t of e.changedTouches) {
        const oldTone = tonesRef.current.get(t.id);
        if (oldTone) {
          oldTone.disconnect();
        }

        const tone = new Tone(audioContext);
        tone.oscillatorType = oscillatorType;
        tonesRef.current.set(t.id, tone);
        const frequency = xToFrequency(t.x);
        const gain = yToGain(t.y);
        tone.frequency.value = frequency;
        tone.gain.value = gain;
        tone.connect(audioContext.destination);
        tone.start();

        recorder.addStep(t.id, frequency, gain);
      }
    })
    .onTouchesMove((e) => {
      setTouches(e.allTouches);

      for (const touch of e.changedTouches) {
        const tone = tonesRef.current.get(touch.id);
        if (tone) {
          const frequency = xToFrequency(touch.x);
          const gain = yToGain(touch.y);
          tone.frequency.value = frequency;
          tone.gain.value = gain;

          recorder.addStep(touch.id, frequency, gain);
        }
      }
    })
    .onTouchesUp(onTouchRemove)
    .onTouchesCancelled(onTouchRemove)
    .shouldCancelWhenOutside(true)
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
