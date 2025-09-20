export function trimInitialSilenceFromChannels(
  channels: Float32Array[]
): Float32Array[] {
  const firstNonZeroIndex = Math.min(
    ...channels.map((c) => c.findIndex((x) => x !== 0)).filter((i) => i !== -1)
  );

  const newChannels = channels.map((c) => c.slice(firstNonZeroIndex));

  return newChannels;
}

export function scale({
  value,
  scaleBeginning = 0,
  scaleEnd,
  min,
  max,
}: {
  value: number;
  scaleBeginning?: number;
  scaleEnd: number;
  min: number;
  max: number;
}): number {
  if (min > max) {
    throw new Error(`Min must be smaller than max (${min} < ${max})`);
  }
  if (value < scaleBeginning || value > scaleEnd) {
    throw new Error(
      `Value must be within scale (${scaleBeginning} < ${value} < ${scaleEnd})`
    );
  }
  if (scaleEnd < scaleBeginning) {
    throw new Error(
      `Scale beginning must be less than scale end (${scaleBeginning} < ${scaleEnd})`
    );
  }
  if (scaleBeginning === scaleEnd) {
    throw new Error(
      `Scale beginning cannot equal scale end (${scaleBeginning})`
    );
  }

  return (
    min + ((max - min) * (value - scaleBeginning)) / (scaleEnd - scaleBeginning)
  );
}
