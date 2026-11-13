type Tick = (time: number, delta: number) => void;

/**
 * One requestAnimationFrame for the whole site: smooth scroll, stage, DOM bindings and
 * the WebGPU renderer all advance in the same frame, in priority order.
 */
class Ticker {
  private listeners: { fn: Tick; priority: number }[] = [];
  private handle = 0;
  private last = 0;
  private running = false;
  private held: number | null = null;

  /** Stops the clock at `time` seconds, or lets it run again with null (used by the test tooling). */
  hold(time: number | null): void {
    this.held = time;
  }

  /** Lower priority runs first. Returns the function that removes the listener. */
  add(fn: Tick, priority = 0): () => void {
    this.listeners.push({ fn, priority });
    this.listeners.sort((a, b) => a.priority - b.priority);
    this.start();
    return () => {
      this.listeners = this.listeners.filter((l) => l.fn !== fn);
      if (this.listeners.length === 0) this.stop();
    };
  }

  private start(): void {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    const loop = (now: number) => {
      if (!this.running) return;
      // scheduled first, so one listener throwing cannot stop the loop for the others
      this.handle = requestAnimationFrame(loop);
      const delta = Math.min(0.1, (now - this.last) / 1000);
      this.last = now;
      for (const l of this.listeners) l.fn(this.held ?? now / 1000, delta);
    };
    this.handle = requestAnimationFrame(loop);
  }

  private stop(): void {
    this.running = false;
    cancelAnimationFrame(this.handle);
  }
}

export const ticker = new Ticker();
