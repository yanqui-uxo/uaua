import { audioContext, ThereminSource } from "@/global";
import { ReactElement } from "react";
import { Button, Switch, Text, TextInput, View } from "react-native";
export default function SourceView({
  source,
  onChange,
}: {
  source: ThereminSource;
  onChange: (source: ThereminSource) => void;
}) {
  function innerComponent(): ReactElement {
    switch (source.type) {
      case "sample":
        return (
          <Button
            title="Play"
            onPress={() => {
              const node = audioContext.createBufferSource();
              node.buffer = source.sample;
              node.connect(audioContext.destination);
              node.start();
            }}
          />
        );
      case "oscillator":
        return <Text>{source.oscillatorType}</Text>;
    }
  }
  return (
    <View style={{ flexDirection: "row" }}>
      <TextInput
        style={{ flex: 2, borderWidth: 1 }}
        value={source.name}
        placeholder="(Type name)"
        placeholderTextColor="gray"
        onChangeText={(text) => {
          onChange({ ...source, name: text });
        }}
      />
      <View style={{ flex: 1, borderWidth: 1 }}>{innerComponent()}</View>
      <Switch
        value={source.selected}
        onValueChange={(v) => {
          onChange({ ...source, selected: v });
        }}
      />
    </View>
  );
}
