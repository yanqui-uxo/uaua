import { Button } from "react-native";
import { OscillatorType } from "react-native-audio-api";

const oscillatorTypes: OscillatorType[] = [
  "sine",
  "square",
  "sawtooth",
  "triangle",
];
export default function OscillatorTypeSelector({
  currentValue,
  onSelect,
}: {
  currentValue: OscillatorType;
  onSelect: (ot: OscillatorType) => void;
}) {
  return (
    <>
      {oscillatorTypes.map((ot) => (
        <Button
          title={ot}
          key={ot}
          color={currentValue === ot ? "blue" : "gray"}
          onPress={() => {
            onSelect(ot);
          }}
        />
      ))}
    </>
  );
}
