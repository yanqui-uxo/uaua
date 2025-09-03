import { ThereminSource } from "@/global/state";
import { ReactElement } from "react";
import { Switch, View } from "react-native";
import SampleView from "./SampleView";
import ToneView from "./ToneView";

export default function SourceView({
  source,
  onChange,
}: {
  source: ThereminSource;
  onChange: (source: ThereminSource) => void;
}) {
  function inner(): ReactElement {
    switch (source.type) {
      case "tone":
        return <ToneView oscillatorType={source.oscillatorType} />;
      case "sample":
        return (
          <SampleView
            sample={source.sample}
            name={source.file?.name}
            onSave={(name, uri) => {
              onChange({
                ...source,
                file: { name, uri, reload: source.file?.reload ?? false },
              });
            }}
          />
        );
    }
  }
  return (
    <View style={{ flexDirection: "row" }}>
      <View style={{ flex: 1, borderWidth: 1 }}>{inner()}</View>
      <Switch
        value={source.selected}
        onValueChange={(v) => {
          onChange({ ...source, selected: v });
        }}
      />
    </View>
  );
}
