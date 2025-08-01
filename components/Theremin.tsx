import { audioContext } from "@/global";
import { ThereminNodeMaker } from "@/theremin/theremin_node_identifier";
import ThereminRecorder from "@/theremin/theremin_recorder";
import ThereminRecorderNode from "@/theremin/theremin_recorder_node";
import { Canvas, Circle } from "@shopify/react-native-skia";
import { useRef, useState } from "react";
import { StyleSheet } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureTouchEvent,
  TouchData,
} from "react-native-gesture-handler";

export default function Theremin({
  recorder,
  makeNode,
}: {
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
    setTouches(e.allTouches.filter((t) => !changedIds.includes(t.id)));

    for (const id of changedIds) {
      const node = nodesRef.current.get(id)!;
      node.disconnect();

      // HACK: compensates for a bug
      // if a node is connected then disconnected in rapid succession the disconnection fails
      setTimeout(() => {
        node.disconnect();
      }, 100);
    }
  }

  const gesture = Gesture.Pan()
    .onTouchesDown((e) => {
      setTouches(e.allTouches);

      for (const t of e.changedTouches) {
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

      for (const t of e.changedTouches) {
        nodesRef.current.get(t.id)!.handleCoord({
          x: t.x,
          y: t.y,
          width: widthRef.current!,
          height: heightRef.current!,
        });
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
