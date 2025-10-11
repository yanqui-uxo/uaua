import { ThereminSource } from "@/global/state";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { ReactElement } from "react";
import { Switch, Text, View } from "react-native";
import SampleView from "./SampleView";
import ToneView from "./ToneView";

export default function SourceView({
  source,
  onChange,
  remove,
}: {
  source: ThereminSource;
  onChange: (source: ThereminSource) => void;
  remove: () => void;
}) {
  function inner(): ReactElement {
    switch (source.type) {
      case "tone":
        return <ToneView oscillatorType={source.oscillatorType} />;
      case "sample":
        return (
          <SampleView
            sample={source.sample}
            name={source.name}
            id={source.id}
            onNameChange={(name) => {
              onChange({
                ...source,
                name: name !== "" ? name : undefined,
              });
            }}
          />
        );
    }
  }
  return (
    <View style={{ flexDirection: "row" }}>
      <View style={{ flex: 1, borderWidth: 1 }}>{inner()}</View>
      <FontAwesome.Button
        name="remove"
        onPress={() => {
          remove();
        }}
      />
      <Text style={{ flex: 1 }}>{source.id}</Text>
      <Switch
        value={source.selected}
        onValueChange={(v) => {
          onChange({ ...source, selected: v });
        }}
      />
    </View>
  );
}
