import ThereminRecorder from "@/theremin/theremin_recorder";
import { useState } from "react";
import { Button } from "react-native";
import { AudioBuffer } from "react-native-audio-api";

export default function RecordButton({
  recorder,
  onRecord,
}: {
  recorder: ThereminRecorder;
  onRecord: (buf: AudioBuffer) => void;
}) {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  return (
    <>
      <Button
        title={isRecording ? "Stop recording" : "Start recording"}
        onPress={() => {
          if (isRecording) {
            recorder.stopRecording().then(onRecord);
          } else {
            recorder.startRecording();
          }
          setIsRecording((b) => !b);
        }}
      />
    </>
  );
}
