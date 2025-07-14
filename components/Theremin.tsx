import { useRef, useState } from "react";
import {
  Gesture,
  GestureDetector,
  GestureTouchEvent,
  TouchData,
} from "react-native-gesture-handler";
import {
  AudioBuffer,
  AudioContext,
  AudioNode,
  AudioParam,
  BaseAudioContext,
  GainNode,
  OfflineAudioContext,
  OscillatorNode,
  OscillatorType,
} from "react-native-audio-api";
import { Button, StyleSheet } from "react-native";
import { Canvas, Circle } from "@shopify/react-native-skia";

class Tone {
  #oscillatorNode: OscillatorNode;
  #gainNode: GainNode;

  constructor(audioContext: BaseAudioContext, oscillatorType: OscillatorType) {
    this.#oscillatorNode = audioContext.createOscillator();
    this.#oscillatorNode.type = oscillatorType;
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

type ToneRecordingStep = { time: number; frequency: number; gain: number };
type ToneRecording = {
  steps: ToneRecordingStep[];
  oscillatorType: OscillatorType;
  stopTime: number;
};
type FullRecording = {
  toneRecordings: ToneRecording[];
  stopTime: number;
};

const sampleRate = 44100;
function fullRecordingToBuffer(
  fullRecording: FullRecording
): Promise<AudioBuffer> {
  const offlineAudioContext = new OfflineAudioContext({
    numberOfChannels: 2,
    length: sampleRate * fullRecording.stopTime,
    sampleRate,
  });

  for (const toneRecording of fullRecording.toneRecordings) {
    const currentTone = new Tone(
      offlineAudioContext,
      toneRecording.oscillatorType
    );
    currentTone.connect(offlineAudioContext.destination);

    const startTime = toneRecording.steps[0].time;
    currentTone.start(startTime);
    currentTone.stop(toneRecording.stopTime);

    for (const recordingStep of toneRecording.steps) {
      currentTone.frequency.setValueAtTime(
        recordingStep.frequency,
        recordingStep.time
      );
      currentTone.gain.setValueAtTime(recordingStep.gain, recordingStep.time);
    }
  }

  return offlineAudioContext.startRendering();
}

const oscillatorTypes: OscillatorType[] = [
  "sine",
  "square",
  "sawtooth",
  "triangle",
];
export default function Theremin() {
  const audioContextRef = useRef<AudioContext>(new AudioContext());

  const [oscillatorType, setOscillatorType] = useState<OscillatorType>("sine");

  const [touches, setTouches] = useState<TouchData[]>([]);
  const widthRef = useRef<number | null>(null);
  const heightRef = useRef<number | null>(null);
  const tonesRef = useRef<Map<number, Tone>>(new Map());

  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(
    null
  );
  const toneRecordingsRef = useRef<Map<number, ToneRecording[]>>(new Map());
  const toneRecordingStepsRef = useRef<Map<number, ToneRecordingStep[]>>(
    new Map()
  );
  const [lastRecording, setLastRecording] = useState<AudioBuffer | null>(null);

  function toneRecordingStepsToToneRecording(id: number) {
    if (recordingStartTime) {
      const steps = toneRecordingStepsRef.current.get(id);
      if (steps) {
        if (!toneRecordingsRef.current.has(id)) {
          toneRecordingsRef.current.set(id, []);
        }
        toneRecordingsRef.current.get(id)!.push({
          steps,
          stopTime: audioContextRef.current.currentTime - recordingStartTime,
          oscillatorType,
        });
        toneRecordingStepsRef.current.delete(id);
      }
    }
  }

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

        toneRecordingStepsToToneRecording(id);
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
      setTouches(e.allTouches);
      for (const t of e.changedTouches) {
        const oldTone = tonesRef.current.get(t.id);
        if (oldTone) {
          oldTone.disconnect();
        }

        const tone = new Tone(audioContextRef.current, oscillatorType);
        tonesRef.current.set(t.id, tone);
        const frequency = xToFrequency(t.x);
        const gain = yToGain(t.y);
        tone.frequency.value = frequency;
        tone.gain.value = gain;
        tone.connect(audioContextRef.current.destination);
        tone.start();

        if (recordingStartTime) {
          if (!toneRecordingStepsRef.current.has(t.id)) {
            toneRecordingStepsRef.current.set(t.id, []);
          }

          toneRecordingStepsRef.current.get(t.id)!.push({
            time: audioContextRef.current.currentTime - recordingStartTime,
            frequency,
            gain,
          });
        }
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

          if (recordingStartTime) {
            if (!toneRecordingStepsRef.current.has(touch.id)) {
              toneRecordingStepsRef.current.set(touch.id, []);
            }

            toneRecordingStepsRef.current.get(touch.id)!.push({
              time: audioContextRef.current.currentTime - recordingStartTime,
              frequency,
              gain,
            });
          }
        }
      }
    })
    .onTouchesUp(onTouchRemove)
    .onTouchesCancelled(onTouchRemove)
    .runOnJS(true);

  return (
    <>
      {oscillatorTypes.map((ot) => (
        <Button
          title={ot}
          key={ot}
          color={oscillatorType === ot ? "blue" : "gray"}
          onPress={() => setOscillatorType(ot)}
        />
      ))}
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
        title={recordingStartTime ? "Stop recording" : "Start recording"}
        onPress={() => {
          if (recordingStartTime) {
            for (const id of toneRecordingStepsRef.current.keys()) {
              toneRecordingStepsToToneRecording(id);
            }
            toneRecordingStepsRef.current = new Map();
            const fullRecording = {
              toneRecordings: [...toneRecordingsRef.current.values()].flat(),
              stopTime:
                audioContextRef.current.currentTime - recordingStartTime,
            };
            toneRecordingsRef.current = new Map();
            fullRecordingToBuffer(fullRecording).then((b) =>
              setLastRecording(b)
            );
            setRecordingStartTime(null);
          } else {
            setRecordingStartTime(audioContextRef.current.currentTime);
          }
        }}
      />
      <Button
        title="Play recording"
        disabled={lastRecording === null}
        onPress={() => {
          const node = audioContextRef.current.createBufferSource();
          node.buffer = lastRecording;
          node.connect(audioContextRef.current.destination);
          node.start();
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    backgroundColor: "skyblue",
  },
});
