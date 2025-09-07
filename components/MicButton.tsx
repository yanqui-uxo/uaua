import ThereminRecorder from "@/theremin/theremin_recorder";
import { useState } from "react";
import { Button } from "react-native";

export default function MicButton({
  recorder,
}: {
  recorder: ThereminRecorder;
}) {
  const [micEnabled, setMicEnabled] = useState(false);

  return (
    <Button
      title={micEnabled ? "Disable microphone" : "Enable microphone"}
      onPress={async () => {
        if (micEnabled) {
          recorder.stopMic();
        } else if (!(await recorder.startMic())) {
          // TODO: handle permission denial
        }

        setMicEnabled((b) => !b);
      }}
    />
  );
}
