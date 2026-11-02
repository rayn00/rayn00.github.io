export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

/** Receipt-time delay line. Input newer than now-delay is never displayed. */
export class History {
  constructor(t, value) { this.reset(t, value); }
  reset(t, value) { this.samples = [{ t, value: { ...value } }]; }
  push(t, value) {
    if (!Number.isFinite(t) || Object.values(value).some(v => !Number.isFinite(v))) return;
    const last = this.samples.at(-1);
    if (t < last.t) return;
    if (t === last.t) last.value = { ...value }; else this.samples.push({ t, value: { ...value } });
    let remove = 0;
    while (remove + 1 < this.samples.length && this.samples[remove + 1].t < t - 2500) remove++;
    if (remove) this.samples.splice(0, remove);
  }
  at(now, delay) {
    if (delay <= 0) return this.samples.at(-1).value;
    const t = now - delay;
    let lo = 0, hi = this.samples.length - 1;
    while (lo < hi) { const mid = Math.ceil((lo + hi) / 2); if (this.samples[mid].t <= t) lo = mid; else hi = mid - 1; }
    return this.samples[lo].value;
  }
}

/** Integrate cursor gain across exact vertical zone boundaries, independent of event frequency. */
export function advanceWithZone(point, dx, dy, gain, left = 400, right = 660) {
  const distance = Math.hypot(dx, dy);
  if (!distance) return { ...point };
  let x = point.x, y = point.y, remaining = distance;
  const ux = dx / distance, uy = dy / distance;
  for (let i = 0; i < 5 && remaining > 1e-9; i++) {
    const probe = x + ux * 1e-7;
    const inside = probe >= left && probe <= right;
    const g = inside ? gain : 1;
    let boundary = Infinity;
    if (ux > 1e-9) boundary = x < left - 1e-9 ? left : x < right - 1e-9 ? right : Infinity;
    if (ux < -1e-9) boundary = x > right + 1e-9 ? right : x > left + 1e-9 ? left : -Infinity;
    const toBoundary = Number.isFinite(boundary) ? (boundary - x) / (ux * g) : Infinity;
    const used = Math.min(remaining, Math.max(0, toBoundary));
    if (used < 1e-10) { x += ux * g * remaining; y += uy * g * remaining; break; }
    x += ux * g * used; y += uy * g * used; remaining -= used;
  }
  return { x: clamp(x, 30, 970), y: clamp(y, 70, 490) };
}

/** For lift-only delay, downward input cannot cause an upward catch-up jump. */
export function liftDisplay(inputHeight, delayedHeight, previousHeight, direction, liftOnly) {
  return liftOnly && direction < 0 ? Math.min(previousHeight, inputHeight) : delayedHeight;
}
export function projectLift(height, handGain, viewGain) {
  return { hand: height * handGain, camera: height * viewGain };
}
export function unwrapAngle(previous, nextWrapped) {
  return previous + Math.atan2(Math.sin(nextWrapped - previous), Math.cos(nextWrapped - previous));
}
