import { useThereminSourceStore } from "@/global";
import ThereminRecorder from "@/theremin/theremin_recorder";
import { useRef, useState } from "react";
import { Button } from "react-native";
import {
  AudioBuffer,
  AudioManager,
  AudioRecorder,
  OfflineAudioContext,
} from "react-native-audio-api";

AudioManager.setAudioSessionOptions({
  iosCategory: "playAndRecord",
  iosMode: "spokenAudio",
  iosOptions: ["defaultToSpeaker", "allowBluetoothA2DP"],
});

AudioManager.requestRecordingPermissions();

function concatenateAudioBuffers(buffers: AudioBuffer[]): AudioBuffer {
  const concatLength = buffers.map((b) => b.length).reduce((acc, l) => acc + l);

  const newBuffer = new OfflineAudioContext({
    numberOfChannels: 0,
    sampleRate: 0,
    length: 0,
  }).createBuffer(
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
}: {
  recorder: ThereminRecorder;
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
        absoluteRecordingStartTime
          ? "Stop mic recording"
          : "Start mic recording"
      }
      onPress={() => {
        if (absoluteRecordingStartTime) {
          audioRecorderRef.current!.stop();
          const recordingBuffer = concatenateAudioBuffers(buffersRef.current);
          addSource({ type: "sample", sample: recordingBuffer });
          recorder.addMicRecording({
            buffer: recordingBuffer,
            absoluteTime: absoluteRecordingStartTime,
          });
          setAbsoluteRecordingStartTime(null);
          audioRecorderRef.current = null;
          buffersRef.current = [];
        } else {
          const recorder = new AudioRecorder({
            sampleRate: 44100,
            bufferLengthInSamples: 441,
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
