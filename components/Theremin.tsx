import { ThereminNodeMaker } from "@/theremin/theremin_node_identifier";
import ThereminRecorder from "@/theremin/theremin_recorder";
import ThereminRecorderNode from "@/theremin/theremin_recorder_node";
import { Canvas, Circle } from "@shopify/react-native-skia";
import { useRef, useState } from "react";
import { AudioContext } from "react-native-audio-api";
import {
  Gesture,
  GestureDetector,
  GestureTouchEvent,
  TouchData,
} from "react-native-gesture-handler";

export default function Theremin({
  recorder,
  makeNode,
  backgroundColor,
}: {
  recorder: ThereminRecorder;
  makeNode: ThereminNodeMaker;
  backgroundColor: string;
}) {
  const [touches, setTouches] = useState<TouchData[]>([]);
  const widthRef = useRef<number | null>(null);
  const heightRef = useRef<number | null>(null);
  const nodesRef = useRef<Map<number, ThereminRecorderNode>>(new Map());
  const audioContextRef = useRef<AudioContext | null>(null);

  function onTouchRemove(e: GestureTouchEvent) {
    const changedIds = e.changedTouches.map((t) => t.id);

    // for some reason allTouches can contain a touch that was just removed
    const confirmedTouches = e.allTouches.filter(
      (t) => !changedIds.includes(t.id)
    );
    setTouches(confirmedTouches);

    for (const id of changedIds) {
      nodesRef.current.get(id)?.disconnect();
    }

    if (confirmedTouches.length === 0) {
      audioContextRef.current?.close();
      audioContextRef.current = null;
    }
  }

  const gesture = Gesture.Pan()
    .onTouchesDown((e) => {
      setTouches(e.allTouches);

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      for (const t of e.changedTouches) {
        const node = new ThereminRecorderNode(
          audioContextRef.current,
          recorder,
          makeNode
        );
        nodesRef.current.set(t.id, node);

        // handleCoord does nothing if given 0 as the time
        node.handleCoord(
          {
            x: t.x,
            y: t.y,
            width: widthRef.current!,
            height: heightRef.current!,
          },
          Number.MIN_VALUE
        );

        node.connect(audioContextRef.current.destination);
        node.start();
      }
    })
    .onTouchesMove((e) => {
      setTouches(e.allTouches);

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      for (const t of e.changedTouches) {
        if (!nodesRef.current.has(t.id)) {
          nodesRef.current.set(
            t.id,
            new ThereminRecorderNode(
              audioContextRef.current,
              recorder,
              makeNode
            )
          );
        }

        nodesRef.current.get(t.id)!.handleCoord(
          {
            x: t.x,
            y: t.y,
            width: widthRef.current!,
            height: heightRef.current!,
          },
          audioContextRef.current!.currentTime
        );
      }
    })
    .onTouchesUp(onTouchRemove)
    .onTouchesCancelled(onTouchRemove)
    .shouldCancelWhenOutside(true)
    .runOnJS(true);

  return (
    <GestureDetector gesture={gesture}>
      <Canvas
        style={{ flex: 1, backgroundColor }}
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
