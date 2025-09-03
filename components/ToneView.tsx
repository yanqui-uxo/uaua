import { Text } from "react-native";
import { OscillatorType } from "react-native-audio-api";

export default function ToneView({
  oscillatorType,
}: {
  oscillatorType: OscillatorType;
}) {
  return <Text>{oscillatorType}</Text>;
}
