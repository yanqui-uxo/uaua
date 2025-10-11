import { ThereminSource, useThereminSourceStore } from "@/global/state";
import SampleThereminNode from "@/theremin/sample_theremin_node";
import { ThereminNodeMaker } from "@/theremin/theremin_node_identifier";
import ThereminRecorder from "@/theremin/theremin_recorder";
import ToneThereminNode from "@/theremin/tone_theremin_node";
import Theremin from "./Theremin";

function thereminSourceToNodeMaker(source: ThereminSource): ThereminNodeMaker {
  switch (source.type) {
    case "tone":
      return (ac) => new ToneThereminNode(ac, source.oscillatorType);
    case "sample":
      return (ac) => new SampleThereminNode(ac, source.sample);
  }
}

const colors = [
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "indigo",
  "violet",
] as const;

export default function ThereminCollection({
  recorder,
}: {
  recorder: ThereminRecorder;
}) {
  const sources = useThereminSourceStore((state) => state.sources);
  return sources
    .filter((s) => s.selected)
    .map((s, i) => (
      <Theremin
        recorder={recorder}
        makeNode={thereminSourceToNodeMaker(s)}
        key={s.id}
        backgroundColor={colors[i % colors.length]}
        text={s.name}
      />
    ));
}
