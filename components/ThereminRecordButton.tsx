import { trimInitialSilence } from "@/global/audio_util";
import ThereminRecorder from "@/theremin/theremin_recorder";
import { useState } from "react";
import { Button } from "react-native";
import { AudioBuffer } from "react-native-audio-api";

export default function ThereminRecordButton({
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
        onPress={async () => {
          if (isRecording) {
            const buffer = await recorder.stopRecording();
            const trimmedBuffer = trimInitialSilence(buffer);

            if (trimmedBuffer) {
              onRecord(trimmedBuffer);
            }
          } else {
            recorder.startRecording();
          }
          setIsRecording((b) => !b);
        }}
      />
    </>
  );
}
