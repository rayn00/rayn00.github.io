import test from 'node:test';
import assert from 'node:assert/strict';
import { PoseHistory } from '../latency.js';
import { deviceQuaternion, relativeDeviceQuaternion } from '../orientation.js';
import { Quaternion, Euler } from '../vendor/three.module.js';
const q = a => new Quaternion().setFromEuler(new Euler(0, a, 0)).toArray();

for (const delay of [0, 50, 100, 200]) {
  test(`step response never occurs before ${delay}ms, and occurs exactly at its deadline`, () => {
    const history = new PoseHistory(0, q(0)); history.push(1000, q(.8));
    if (delay) assert.deepEqual(history.sample(1000 + delay - .001, delay).q, q(0));
    assert.deepEqual(history.sample(1000 + delay, delay).q, q(.8));
  });
}
test('irregular input uses the newest sample at or before the target, without early interpolation', () => {
  const history = new PoseHistory(0, q(0));
  history.push(30, q(.1)); history.push(47, q(.2)); history.push(72, q(.4));
  assert.equal(history.sample(100, 50).t, 47);
  assert.equal(history.sample(121.999, 50).t, 47);
  assert.equal(history.sample(122, 50).t, 72);
});
test('all delays preserve a short burst even after the input stops', () => {
  for (const delay of [50, 100, 200]) {
    const history = new PoseHistory(0, q(0)); history.push(100, q(1)); history.push(110, q(0));
    assert.deepEqual(history.sample(100 + delay, delay).q, q(1));
    assert.deepEqual(history.sample(109 + delay, delay).q, q(1));
    assert.deepEqual(history.sample(110 + delay, delay).q, q(0));
  }
});
test('reset removes queued motion and condition switching preserves history', () => {
  const history = new PoseHistory(0, q(0)); history.push(100, q(.4)); history.push(200, q(.8));
  assert.deepEqual(history.sample(240, 0).q, q(.8));
  assert.deepEqual(history.sample(240, 100).q, q(.4));
  history.reset(-760, q(0)); assert.deepEqual(history.sample(240, 200).q, q(0));
});
test('history prunes while retaining the anchor before a long idle period', () => {
  const history = new PoseHistory(0, q(0)); history.push(10, q(.1)); history.push(10000, q(.2));
  assert.deepEqual(history.sample(10050, 200).q, q(.1));
  for (let i = 10001; i < 20000; i++) history.push(i, q(i / 10000));
  assert.ok(history.samples.length <= 2003);
  assert.equal(history.sample(20000, 200).t, 19800);
});
test('null / invalid samples cannot poison the pose buffer', () => {
  const history = new PoseHistory(0, q(0)); history.push(NaN, q(0)); history.push(1, [NaN, 0, 0, 1]); history.push(-1, q(1));
  assert.equal(history.samples.length, 1);
});
test('device neutral pose and calibration remain stable in portrait and landscape', () => {
  const base = new Quaternion().setFromEuler(new Euler(-.12, 0, 0));
  for (const angle of [0, 90, -90, 180]) {
    const reference = deviceQuaternion(42, 70, -12, angle);
    const calibrated = relativeDeviceQuaternion(reference, reference, base);
    assert.ok(calibrated.angleTo(base) < 1e-7);
    assert.ok(Math.abs(calibrated.length() - 1) < 1e-10);
  }
  assert.ok(deviceQuaternion(0, 90, 0, 0).angleTo(new Quaternion()) < 1e-7);
});
test('heading wrap from 359 to 1 degrees remains a two-degree turn', () => {
  const start = deviceQuaternion(359, 90, 0, 0), end = deviceQuaternion(1, 90, 0, 0);
  assert.ok(Math.abs(start.angleTo(end) - Math.PI / 90) < 1e-8);
});
test('relative rotation is preserved when calibrating an arbitrary device posture', () => {
  const base = new Quaternion().setFromEuler(new Euler(-.12, 0, 0));
  const ref = deviceQuaternion(130, 63, 20, 90), raw = deviceQuaternion(140, 68, 25, 90);
  const out = relativeDeviceQuaternion(raw, ref, base);
  assert.ok(Math.abs(out.angleTo(base) - raw.angleTo(ref)) < 1e-8);
});
