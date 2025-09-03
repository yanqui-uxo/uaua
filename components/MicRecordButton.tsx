import { useThereminSourceStore } from "@/global/state";
import {
  genericAudioContext,
  sampleRate,
  trimInitialSilence,
} from "@/global/util";
import ThereminRecorder from "@/theremin/theremin_recorder";
import { useRef, useState } from "react";
import { Button } from "react-native";
import {
  AudioBuffer,
  AudioManager,
  AudioRecorder,
} from "react-native-audio-api";

AudioManager.setAudioSessionOptions({
  iosCategory: "playAndRecord",
  iosMode: "spokenAudio",
  iosOptions: ["defaultToSpeaker", "allowBluetoothA2DP"],
});

AudioManager.requestRecordingPermissions();

function concatenateAudioBuffers(buffers: AudioBuffer[]): AudioBuffer {
  const concatLength = buffers.map((b) => b.length).reduce((acc, l) => acc + l);

  const newBuffer = genericAudioContext.createBuffer(
    buffers[0].numberOfChannels,
    concatLength,
    buffers[0].sampleRate
  );

  for (let i = 0; i < buffers[0].numberOfChannels; i++) {
    const iterator = (function* () {
      for (const buffer of buffers) {
        yield* buffer.getChannelData(i);
      }
    })();

    // HACK: seems to return only zeroes if provided iterator directly
    newBuffer.copyToChannel(new Float32Array([...iterator]), i);
  }

  return newBuffer;
}

export default function MicRecordButton({
  recorder,
  onRecord,
}: {
  recorder: ThereminRecorder;
  onRecord: (buffer: AudioBuffer) => void;
}) {
  const [absoluteRecordingStartTime, setAbsoluteRecordingStartTime] = useState<
    number | null
  >(null);
  const addSource = useThereminSourceStore((state) => state.addSource);

  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const buffersRef = useRef<AudioBuffer[]>([]);

  return (
    <Button
      title={
        absoluteRecordingStartTime ? "Disable microphone" : "Enable microphone"
      }
      onPress={async () => {
        if ((await AudioManager.checkRecordingPermissions()) !== "Granted") {
          return;
        }

        if (absoluteRecordingStartTime) {
          audioRecorderRef.current!.stop();

          const recordingBuffer = trimInitialSilence(
            concatenateAudioBuffers(buffersRef.current)
          );
          onRecord(recordingBuffer);
          recorder.addMicRecording({
            buffer: recordingBuffer,
            absoluteTime: absoluteRecordingStartTime,
          });

          setAbsoluteRecordingStartTime(null);
          audioRecorderRef.current = null;
          buffersRef.current = [];
        } else {
          const recorder = new AudioRecorder({
            sampleRate,
            bufferLengthInSamples: Math.round(sampleRate / 100),
          });
          recorder.onAudioReady((e) => {
            buffersRef.current.push(e.buffer);
          });
          recorder.start();

          audioRecorderRef.current = recorder;
          setAbsoluteRecordingStartTime(Date.now());
        }
      }}
    />
  );
}
