import { Button } from "react-native";
import { Recorder } from "@/util/recorder";
import { useState } from "react";
import { AudioBuffer, AudioContext } from "react-native-audio-api";

export default function RecordButtons({
  audioContext,
  recorder,
}: {
  audioContext: AudioContext;
  recorder: Recorder;
}) {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [lastRecording, setLastRecording] = useState<AudioBuffer | null>(null);
  return (
    <>
      <Button
        title={isRecording ? "Stop recording" : "Start recording"}
        onPress={() => {
          if (isRecording) {
            recorder.stopRecording().then((b) => setLastRecording(b));
          } else {
            setLastRecording(null);
            recorder.startRecording();
          }
          setIsRecording((b) => !b);
        }}
      />
      <Button
        title="Play recording"
        disabled={lastRecording === null}
        onPress={() => {
          const node = audioContext.createBufferSource();
          node.buffer = lastRecording!;
          node.connect(audioContext.destination);
          node.start();
        }}
      />
    </>
  );
}
