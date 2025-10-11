import FontAwesome from "@expo/vector-icons/FontAwesome";
import { File, Paths } from "expo-file-system";
import { useState } from "react";
import { Alert, TextInput, View } from "react-native";
import { AudioBuffer } from "react-native-audio-api";
import { encode } from "wav-encoder";

async function save(sample: AudioBuffer, file: File) {
  if (file.exists) {
    throw new Error("Cannot overwrite existing file");
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
}

export default function SampleView({
  sample,
  name,
  id,
  onNameChange,
}: {
  sample: AudioBuffer;
  name?: string;
  id: string;
  onNameChange: (name: string) => void;
}) {
  const file = new File(Paths.document, `${id}.wav`);
  const [fileExists, setFileExists] = useState(file.exists);
  return (
    <View style={{ flexDirection: "row" }}>
      <TextInput
        style={{ flex: 1, borderWidth: 1 }}
        onChangeText={onNameChange}
        value={name}
        placeholder="Enter name"
        placeholderTextColor="gray"
      />
      {!fileExists && (
        <FontAwesome.Button
          name="save"
          onPress={() => {
            if (file.exists) {
              return;
            }
            save(sample, file);
            setFileExists(true);
          }}
        />
      )}
      {fileExists && (
        <FontAwesome.Button
          name="trash"
          onPress={() => {
            Alert.alert("Are you sure you want to delete this file?", "", [
              {
                text: "Yes",
                onPress: () => {
                  if (file.exists) {
                    file.delete();
                  }
                  setFileExists(false);
                },
              },
              { text: "No" },
            ]);
          }}
        />
      )}
    </View>
  );
}
