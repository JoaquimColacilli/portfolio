/** A 2D polyline that can be walked at constant speed. */
export class Walk {
  private readonly cumulative: number[] = [0];
  readonly length: number;

  constructor(private readonly xy: number[]) {
    for (let i = 2; i < xy.length; i += 2) {
      this.cumulative.push(this.cumulative[this.cumulative.length - 1] + Math.hypot(xy[i] - xy[i - 2], xy[i + 1] - xy[i - 1]));
    }
    this.length = this.cumulative[this.cumulative.length - 1] || 1;
  }

  /** Position at t (0…1 along the path). */
  at(t: number, out: { x: number; y: number }): { x: number; y: number } {
    const d = Math.min(1, Math.max(0, t)) * this.length;
    const c = this.cumulative;
    let i = 1;
    while (i < c.length - 1 && c[i] < d) i++;
    const span = c[i] - c[i - 1] || 1;
    const f = (d - c[i - 1]) / span;
    out.x = this.xy[(i - 1) * 2] + (this.xy[i * 2] - this.xy[(i - 1) * 2]) * f;
    out.y = this.xy[(i - 1) * 2 + 1] + (this.xy[i * 2 + 1] - this.xy[(i - 1) * 2 + 1]) * f;
    return out;
  }
}

/** Smooth curve through 2D points (Catmull-Rom), as x, y pairs. */
export function spline(points: [number, number][], samplesPerSpan = 14): number[] {
  const out: number[] = [];
  const p = (i: number) => points[Math.min(points.length - 1, Math.max(0, i))];
  for (let i = 0; i < points.length - 1; i++) {
    const [p0, p1, p2, p3] = [p(i - 1), p(i), p(i + 1), p(i + 2)];
    for (let k = 0; k < samplesPerSpan; k++) {
      const t = k / samplesPerSpan;
      const t2 = t * t;
      const t3 = t2 * t;
      for (let c = 0; c < 2; c++) {
        out.push(0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3));
      }
    }
  }
  out.push(points[points.length - 1][0], points[points.length - 1][1]);
  return out;
}
