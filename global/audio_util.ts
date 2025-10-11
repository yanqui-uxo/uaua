import {
  AudioBuffer,
  AudioManager,
  OfflineAudioContext,
} from "react-native-audio-api";
import { trimInitialSilenceFromChannels } from "./util";

AudioManager.setAudioSessionOptions({
  iosCategory: "playAndRecord",
  iosMode: "spokenAudio",
  iosOptions: ["defaultToSpeaker", "mixWithOthers"],
});

AudioManager.requestRecordingPermissions();

export const sampleRate = 44100;
export const genericAudioContext = new OfflineAudioContext({
  numberOfChannels: 0,
  length: 0,
  sampleRate,
});

export function trimInitialSilence(buffer: AudioBuffer): AudioBuffer | null {
  const channels: Float32Array[] = [];
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  const newChannels = trimInitialSilenceFromChannels(channels);

  if (newChannels[0].length === 0) {
    return null;
  }

  const newBuffer = genericAudioContext.createBuffer(
    buffer.numberOfChannels,
    newChannels[0].length,
    buffer.sampleRate
  );

  for (const [i, channel] of newChannels.entries()) {
    newBuffer.copyToChannel(channel, i);
  }

  return newBuffer;
}

export function concatenateAudioBuffers(buffers: AudioBuffer[]): AudioBuffer {
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
