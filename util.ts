import { AudioBuffer, OfflineAudioContext } from "react-native-audio-api";

export function trimInitialSilence(buffer: AudioBuffer): AudioBuffer {
  const channels: Float32Array[] = [];
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }
  const firstNonZeroIndex = Math.min(
    ...channels.map((c) => c.findIndex((x) => x !== 0)).filter((i) => i !== -1)
  );

  const newChannels = channels.map((c) => c.slice(firstNonZeroIndex));

  const newBuffer = new OfflineAudioContext({
    numberOfChannels: 0,
    length: 0,
    sampleRate: 0,
  }).createBuffer(
    buffer.numberOfChannels,
    newChannels[0].length,
    buffer.sampleRate
  );

  for (const [i, channel] of newChannels.entries()) {
    newBuffer.copyToChannel(channel, i);
  }

  return newBuffer;
}
