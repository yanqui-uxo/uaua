import { scale, trimInitialSilenceFromChannels } from "@/global/util";

test("trimInitialSilenceFromArrays works", () => {
  const channels = [
    new Float32Array([0, 0, 0, 0.5, 0.5, 0.5]),
    new Float32Array([0, 0, 0.5, 0.5, 0.5, 0.5]),
  ];
  const newChannels = trimInitialSilenceFromChannels(channels);
  expect([...newChannels[0]]).toEqual([0, 0.5, 0.5, 0.5]);
  expect([...newChannels[1]]).toEqual([0.5, 0.5, 0.5, 0.5]);
});

test("scale works", () => {
  expect(
    scale({ value: 1, scaleBeginning: 0, scaleEnd: 2, min: 1, max: 5 })
  ).toBe(3);
});

test("scale errors on scaleBeginning < scaleEnd", () => {
  expect(() => {
    scale({ value: 0, scaleBeginning: 5, scaleEnd: 0, min: 0, max: 1 });
  }).toThrow();
});

test("scale errors on min > max", () => {
  expect(() => {
    scale({ value: 0, scaleBeginning: 0, scaleEnd: 1, min: 1, max: 0 });
  }).toThrow();
});

test("scale errors on value outside of scale", () => {
  expect(() => {
    scale({ value: 2, scaleBeginning: 0, scaleEnd: 1, min: 0, max: 1 });
  }).toThrow();
});

test("scale errors on scaleBeginning === scaleEnd", () => {
  expect(() => {
    scale({ value: 0, scaleBeginning: 0, scaleEnd: 0, min: 0, max: 1 });
  }).toThrow();
});
