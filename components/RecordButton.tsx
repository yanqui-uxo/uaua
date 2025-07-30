import ThereminRecorder, { Recording } from "@/theremin/theremin_recorder";
import { useState } from "react";
import { Button } from "react-native";

export default function RecordButton({
  recorder,
  onRecord,
}: {
  recorder: ThereminRecorder;
  onRecord: (buf: Recording) => void;
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
