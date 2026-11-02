/** Timestamped sample-and-hold. Never reads an input newer than now - delay. */
export class PoseHistory {
  constructor(initialTime, initialPose, capacity = 16384) {
    this.capacity = capacity;
    this.samples = [{ t: initialTime, q: [...initialPose] }];
  }
  push(t, q) {
    if (!Number.isFinite(t) || q.length !== 4 || !q.every(Number.isFinite)) return;
    const last = this.samples[this.samples.length - 1];
    if (t < last.t) return;
    if (t === last.t) this.samples[this.samples.length - 1] = { t, q: [...q] };
    else this.samples.push({ t, q: [...q] });
    // Keep an anchor preceding the retained 2-second window (max delay is 200ms).
    const cutoff = t - 2000;
    let remove = 0;
    while (remove + 1 < this.samples.length && this.samples[remove + 1].t < cutoff) remove++;
    if (remove) this.samples.splice(0, remove);
    if (this.samples.length > this.capacity) this.samples.splice(0, this.samples.length - this.capacity);
  }
  sample(now, delay) {
    if (delay === 0) return this.samples[this.samples.length - 1];
    const target = now - delay;
    let lo = 0, hi = this.samples.length - 1;
    if (target < this.samples[0].t) return this.samples[0];
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (this.samples[mid].t <= target) lo = mid;
      else hi = mid - 1;
    }
    return this.samples[lo];
  }
  reset(t, q) { this.samples = [{ t, q: [...q] }]; }
}
