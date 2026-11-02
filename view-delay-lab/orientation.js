import { Quaternion, Euler, Vector3, MathUtils } from './vendor/three.module.js';
const correction = new Quaternion(-Math.SQRT1_2, 0, 0, Math.SQRT1_2);
const zAxis = new Vector3(0, 0, 1);
/** W3C intrinsic Z-X-Y device angles -> Three camera orientation, including screen rotation. */
export function deviceQuaternion(alpha, beta, gamma, screenAngle = 0) {
  const euler = new Euler(MathUtils.degToRad(beta), MathUtils.degToRad(alpha), -MathUtils.degToRad(gamma), 'YXZ');
  return new Quaternion().setFromEuler(euler).multiply(correction)
    .multiply(new Quaternion().setFromAxisAngle(zAxis, -MathUtils.degToRad(screenAngle))).normalize();
}
export function relativeDeviceQuaternion(raw, reference, base) {
  return base.clone().multiply(reference.clone().invert()).multiply(raw).normalize();
}
