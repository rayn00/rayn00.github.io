// Demo-defined harmonic model; not a reproduction of equations from a cited paper.
// Ideal periodic motion. Units: amplitude mm, mass g, frequency Hz; outputs SI.
export const TAU = 2 * Math.PI;
export function sample(phase, { amplitude, mass, frequency, asymmetry, direction }) {
  const q = TAU * phase, w = TAU * frequency, A = amplitude / 1000, m = mass / 1000;
  const r = asymmetry, d = direction;
  const x = d * A * (Math.cos(q) + r / 4 * Math.cos(2 * q) - r / 4);
  const v = -d * A * w * (Math.sin(q) + r / 2 * Math.sin(2 * q));
  const a = -d * A * w * w * (Math.cos(q) + r * Math.cos(2 * q));
  return { x, v, a, force: -m * a };
}
export function stats(p, count = 4096) {
  let max = -Infinity, min = Infinity, positive = 0, negative = 0, sum = 0, above = 0;
  for (let i = 0; i < count; i++) {
    const f = sample((i + .5) / count, p).force;
    max = Math.max(max, f); min = Math.min(min, f); sum += f;
    if (f > 0) { positive += f; above++; } else negative += f;
  }
  const dt = 1 / p.frequency / count;
  return { max, min, mean: sum / count, positiveImpulse: positive * dt, negativeImpulse: negative * dt,
    ratio: Math.max(max, -min) / Math.min(max, -min), positiveFraction: above / count };
}
export function advancePhase(phase, elapsed, frequency, speed) {
  return ((phase + Math.max(0, elapsed) * frequency * speed) % 1 + 1) % 1;
}
export function csv(p, count = 1000) {
  const header = 'time_s,phase,x_m,v_m_s,a_m_s2,force_on_case_N,symmetric_force_N';
  const lines = [header];
  for (let i = 0; i <= count; i++) {
    const phase = i / count, s = sample(phase, p), baseline = sample(phase, { ...p, asymmetry: 0 });
    lines.push([phase / p.frequency, phase, s.x, s.v, s.a, s.force, baseline.force].map(n => n.toPrecision(12)).join(','));
  }
  return lines.join('\n');
}
