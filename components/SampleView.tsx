import FontAwesome from "@expo/vector-icons/FontAwesome";
import { File, Paths } from "expo-file-system/next";
import { useState } from "react";
import { Alert, Button, TextInput, View } from "react-native";
import { AudioBuffer, AudioContext } from "react-native-audio-api";
import { encode } from "wav-encoder";

export default function SampleView({
  sample,
  name,
  onSave,
}: {
  sample: AudioBuffer;
  name?: string;
  onSave: (name: string, uri: string) => void;
}) {
  const [newName, setNewName] = useState(name ?? "");
  return (
    <View style={{ flexDirection: "row" }}>
      <TextInput
        onChangeText={setNewName}
        value={newName}
        placeholder="Enter name"
        placeholderTextColor="gray"
      />
      <Button
        title="Play"
        onPress={() => {
          const audioContext = new AudioContext();
          const node = audioContext.createBufferSource();
          node.buffer = sample;
          node.onEnded = () => {
            audioContext.close();
          };
          node.connect(audioContext.destination);
          node.start();
        }}
      />
      <FontAwesome.Button
        name="save"
        onPress={async () => {
          const file = new File(Paths.document, newName);
          if (file.exists) {
            Alert.alert("Error", "Cannot overwrite existing file", [
              { text: "OK" },
            ]);
            return;
          }

          const channels: Float32Array[] = [];
          for (let i = 0; i < sample.numberOfChannels; i++) {
            channels.push(sample.getChannelData(i));
          }

          const data = new Uint8Array(
            await encode({
              sampleRate: sample.sampleRate,
              channelData: channels,
            })
          );

          file.write(data);
        }}
      />
    </View>
  );
}
