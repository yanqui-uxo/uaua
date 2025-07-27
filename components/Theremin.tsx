import { ThereminNodeMaker } from "@/util/theremin_node_identifier";
import ThereminRecorder from "@/util/theremin_recorder";
import ThereminRecorderNode from "@/util/theremin_recorder_node";
import { Canvas, Circle } from "@shopify/react-native-skia";
import { useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { AudioContext } from "react-native-audio-api";
import {
  Gesture,
  GestureDetector,
  GestureTouchEvent,
  TouchData,
} from "react-native-gesture-handler";

// TODO: fix node being held on six-finger tap on iOS
export default function Theremin({
  audioContext,
  recorder,
  makeNode,
}: {
  audioContext: AudioContext;
  recorder: ThereminRecorder;
  makeNode: ThereminNodeMaker;
}) {
  const [touches, setTouches] = useState<TouchData[]>([]);
  const widthRef = useRef<number | null>(null);
  const heightRef = useRef<number | null>(null);
  const nodesRef = useRef<Map<number, ThereminRecorderNode>>(new Map());

  function onTouchRemove(e: GestureTouchEvent) {
    const changedIds = e.changedTouches.map((t) => t.id);

    // for some reason allTouches can contain a touch that was just removed
    const confirmedTouches = e.allTouches.filter(
      (t) => !changedIds.includes(t.id)
    );
    setTouches(confirmedTouches);

    const confirmedIds = confirmedTouches.map((t) => t.id);
    for (const [id, node] of nodesRef.current) {
      if (!confirmedIds.includes(id)) {
        node.disconnect();
      }
    }
  }

  const gesture = Gesture.Pan()
    .onTouchesDown((e) => {
      setTouches(e.allTouches);

      for (const t of e.changedTouches) {
        const oldNode = nodesRef.current.get(t.id);
        if (oldNode) {
          oldNode.disconnect();
        }

        const node = new ThereminRecorderNode(audioContext, recorder, makeNode);
        nodesRef.current.set(t.id, node);
        node.handleCoord({
          x: t.x,
          y: t.y,
          width: widthRef.current!,
          height: heightRef.current!,
        });
        node.connect(audioContext.destination);
        node.start();
      }
    })
    .onTouchesMove((e) => {
      setTouches(e.allTouches);

      for (const touch of e.changedTouches) {
        const node = nodesRef.current.get(touch.id);
        if (node) {
          node.handleCoord({
            x: touch.x,
            y: touch.y,
            width: widthRef.current!,
            height: heightRef.current!,
          });
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
