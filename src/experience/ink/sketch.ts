import { Matrix4, Vector3 } from 'three/webgpu';
import { LETTERING, type Letter } from '../data/lettering';
import { NUMERALS } from '../data/numerals';

/** One pen stroke: a polyline in local 3D space plus how the pen behaves on it. */
export interface Stroke {
  /** x, y, z triples */
  pts: number[];
  closed: boolean;
  /** line width in world units */
  width: number;
  /** 0 = ink (white), 1 = signal (amber) */
  tone: number;
  /** dash period in world units; 0 draws a solid line */
  dash: number;
  /** base opacity */
  alpha: number;
  /** 0…1 — how much the line glows; small lettering stays crisp at 0 */
  glow: number;
  /** position on the drawing timeline, resolved to t0/t1 by finalize() */
  order: number;
  t0: number;
  t1: number;
}

export interface Pen {
  width: number;
  tone: number;
  dash: number;
  alpha: number;
  glow: number;
}

export const TAU = Math.PI * 2;

type Align = 'left' | 'center' | 'right';

/**
 * A tiny drafting DSL. Every primitive is expressed in a local 2D plane (x right, y up)
 * and transformed into 3D by the current matrix, so the same vocabulary — lines, arcs,
 * dimensions, hatching, lettering — builds every drawing of the site.
 *
 * The order in which primitives are called is the order in which the pen draws them.
 */
export class Sketch {
  readonly strokes: Stroke[] = [];
  private matrix = new Matrix4();
  private matrices: Matrix4[] = [];
  private pen: Pen = { width: 0.014, tone: 0, dash: 0, alpha: 1, glow: 1 };
  private pens: Pen[] = [];
  private cursor = 0;
  private grouped = 0;
  private stepSize = 1;
  private readonly v = new Vector3();
  private readonly m = new Matrix4();

  // ── transforms ─────────────────────────────────────────────────────────────
  push(): this {
    this.matrices.push(this.matrix.clone());
    this.pens.push({ ...this.pen });
    return this;
  }

  pop(): this {
    const m = this.matrices.pop();
    const p = this.pens.pop();
    if (m) this.matrix.copy(m);
    if (p) this.pen = p;
    return this;
  }

  /** Runs `fn` with an isolated transform and pen. */
  scope(fn: () => void): this {
    this.push();
    fn();
    return this.pop();
  }

  translate(x: number, y: number, z = 0): this {
    this.matrix.multiply(this.m.makeTranslation(x, y, z));
    return this;
  }

  scale(x: number, y = x, z = 1): this {
    this.matrix.multiply(this.m.makeScale(x, y, z));
    return this;
  }

  rotate(angle: number): this {
    this.matrix.multiply(this.m.makeRotationZ(angle));
    return this;
  }

  rotateX(angle: number): this {
    this.matrix.multiply(this.m.makeRotationX(angle));
    return this;
  }

  rotateY(angle: number): this {
    this.matrix.multiply(this.m.makeRotationY(angle));
    return this;
  }

  // ── pen ────────────────────────────────────────────────────────────────────
  ink(pen: Partial<Pen>): this {
    Object.assign(this.pen, pen);
    return this;
  }

  /** Thin, dimmer construction line. */
  thin(alpha = 0.55): this {
    return this.ink({ width: 0.009, alpha, dash: 0, tone: 0, glow: 0.35 });
  }

  /** Regular outline. */
  bold(alpha = 1): this {
    return this.ink({ width: 0.014, alpha, dash: 0, tone: 0, glow: 1 });
  }

  /** Hidden or projected edge: dashed, dim. */
  dashed(alpha = 0.6, period = 0.11): this {
    return this.ink({ width: 0.009, alpha, dash: period, tone: 0, glow: 0.2 });
  }

  /** The warm signal colour, reserved for the line that runs through the whole site. */
  signal(width = 0.02): this {
    return this.ink({ width, alpha: 1, dash: 0, tone: 1, glow: 1 });
  }

  // ── timeline ───────────────────────────────────────────────────────────────
  /** Everything drawn inside `fn` starts at the same moment. */
  together(fn: () => void): this {
    this.grouped++;
    fn();
    this.grouped--;
    if (this.grouped === 0) this.cursor += this.stepSize;
    return this;
  }

  /** Leaves a pause on the timeline. */
  wait(n = 1): this {
    this.cursor += n;
    return this;
  }

  /** Sets how far the timeline advances after each primitive. */
  pace(step: number): this {
    this.stepSize = step;
    return this;
  }

  // ── primitives ─────────────────────────────────────────────────────────────
  /** Polyline from x, y pairs. */
  path(xy: number[], closed = false): this {
    const pts: number[] = [];
    for (let i = 0; i < xy.length; i += 2) {
      this.v.set(xy[i], xy[i + 1], 0).applyMatrix4(this.matrix);
      // skip repeated points: they would break the ribbon tangents
      const n = pts.length;
      if (n >= 3 && Math.abs(pts[n - 3] - this.v.x) + Math.abs(pts[n - 2] - this.v.y) + Math.abs(pts[n - 1] - this.v.z) < 1e-6) continue;
      pts.push(this.v.x, this.v.y, this.v.z);
    }
    if (pts.length < 6) return this;
    this.strokes.push({ pts, closed, ...this.pen, order: this.cursor, t0: 0, t1: 1 });
    if (this.grouped === 0) this.cursor += this.stepSize;
    return this;
  }

  /** Polyline from x, y, z triples (already in the local 3D space). */
  path3(xyz: number[], closed = false): this {
    const pts: number[] = [];
    for (let i = 0; i < xyz.length; i += 3) {
      this.v.set(xyz[i], xyz[i + 1], xyz[i + 2]).applyMatrix4(this.matrix);
      pts.push(this.v.x, this.v.y, this.v.z);
    }
    if (pts.length < 6) return this;
    this.strokes.push({ pts, closed, ...this.pen, order: this.cursor, t0: 0, t1: 1 });
    if (this.grouped === 0) this.cursor += this.stepSize;
    return this;
  }

  line(x1: number, y1: number, x2: number, y2: number): this {
    return this.path([x1, y1, x2, y2]);
  }

  /** Rectangle centred on (cx, cy), optionally with rounded corners. */
  rect(cx: number, cy: number, w: number, h: number, r = 0): this {
    const x0 = cx - w / 2;
    const y0 = cy - h / 2;
    const x1 = cx + w / 2;
    const y1 = cy + h / 2;
    if (r <= 0) return this.path([x0, y0, x1, y0, x1, y1, x0, y1], true);
    const rr = Math.min(r, w / 2, h / 2);
    const xy: number[] = [];
    const corner = (ox: number, oy: number, a0: number) => {
      for (let i = 0; i <= 6; i++) {
        const a = a0 + (i / 6) * (Math.PI / 2);
        xy.push(ox + Math.cos(a) * rr, oy + Math.sin(a) * rr);
      }
    };
    corner(x1 - rr, y0 + rr, -Math.PI / 2);
    corner(x1 - rr, y1 - rr, 0);
    corner(x0 + rr, y1 - rr, Math.PI / 2);
    corner(x0 + rr, y0 + rr, Math.PI);
    return this.path(xy, true);
  }

  /** Circle or arc (angles in radians, counter-clockwise). */
  circle(cx: number, cy: number, r: number, a0 = 0, a1 = TAU): this {
    return this.ellipse(cx, cy, r, r, a0, a1);
  }

  ellipse(cx: number, cy: number, rx: number, ry: number, a0 = 0, a1 = TAU): this {
    const full = Math.abs(a1 - a0) >= TAU - 1e-6;
    const segs = Math.max(8, Math.ceil((Math.abs(a1 - a0) / TAU) * Math.min(96, 20 + Math.max(rx, ry) * 44)));
    const xy: number[] = [];
    const count = full ? segs : segs + 1;
    for (let i = 0; i < count; i++) {
      const a = a0 + (i / segs) * (a1 - a0);
      xy.push(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry);
    }
    return this.path(xy, full);
  }

  /** Regular polygon. */
  ngon(cx: number, cy: number, r: number, sides: number, rot = 0): this {
    const xy: number[] = [];
    for (let i = 0; i < sides; i++) {
      const a = rot + (i / sides) * TAU;
      xy.push(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    }
    return this.path(xy, true);
  }

  /** Cubic Bézier. */
  bezier(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, segs = 28): this {
    const xy: number[] = [];
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      const u = 1 - t;
      xy.push(
        u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3,
        u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3,
      );
    }
    return this.path(xy);
  }

  /** Centre mark: a small cross. */
  cross(x: number, y: number, size = 0.08): this {
    return this.together(() => {
      this.line(x - size, y, x + size, y);
      this.line(x, y - size, x, y + size);
    });
  }

  /** Line with an open arrowhead at its end. */
  arrow(x1: number, y1: number, x2: number, y2: number, head = 0.09): this {
    const a = Math.atan2(y2 - y1, x2 - x1);
    return this.together(() => {
      this.line(x1, y1, x2, y2);
      this.path([
        x2 - Math.cos(a - 0.42) * head,
        y2 - Math.sin(a - 0.42) * head,
        x2,
        y2,
        x2 - Math.cos(a + 0.42) * head,
        y2 - Math.sin(a + 0.42) * head,
      ]);
    });
  }

  /** 45° section hatching inside an axis-aligned rectangle. */
  hatch(cx: number, cy: number, w: number, h: number, spacing = 0.09): this {
    const x0 = cx - w / 2;
    const y0 = cy - h / 2;
    return this.together(() => {
      for (let t = -h + spacing; t < w; t += spacing) {
        const xa = Math.max(t, 0);
        const xb = Math.min(t + h, w);
        if (xb - xa > 1e-3) this.line(x0 + xa, y0 + xa - t, x0 + xb, y0 + xb - t);
      }
    });
  }

  /**
   * Dimension line between two points, offset to the side, with extension lines,
   * oblique end ticks and an optional label — the way lengths are noted on a drawing.
   */
  dim(x1: number, y1: number, x2: number, y2: number, offset: number, label = '', size = 0.085): this {
    const len = Math.hypot(x2 - x1, y2 - y1) || 1;
    const dx = (x2 - x1) / len;
    const dy = (y2 - y1) / len;
    const nx = -dy;
    const ny = dx;
    const sign = Math.sign(offset) || 1;
    const ax = x1 + nx * offset;
    const ay = y1 + ny * offset;
    const bx = x2 + nx * offset;
    const by = y2 + ny * offset;
    const gap = 0.05 * sign;
    const over = 0.07 * sign;
    const tick = 0.05;
    return this.scope(() => {
      this.thin(0.6);
      this.together(() => {
        this.line(x1 + nx * gap, y1 + ny * gap, ax + nx * over, ay + ny * over);
        this.line(x2 + nx * gap, y2 + ny * gap, bx + nx * over, by + ny * over);
      });
      this.together(() => {
        this.line(ax, ay, bx, by);
        this.line(ax - (dx + nx) * tick, ay - (dy + ny) * tick, ax + (dx + nx) * tick, ay + (dy + ny) * tick);
        this.line(bx - (dx + nx) * tick, by - (dy + ny) * tick, bx + (dx + nx) * tick, by + (dy + ny) * tick);
      });
      if (label) {
        this.scope(() => {
          let angle = Math.atan2(dy, dx);
          let flip = 1;
          if (angle > Math.PI / 2 + 1e-3 || angle < -Math.PI / 2 - 1e-3) {
            angle += Math.PI;
            flip = -1;
          }
          // keep the label on the outer side of the dimension line, reading left to right
          const outward = sign * flip;
          this.translate((ax + bx) / 2, (ay + by) / 2).rotate(angle);
          this.text(label, 0, outward > 0 ? 0.045 : -0.045 - size, size, 'center');
        });
      }
    });
  }

  /** Single-stroke plotter lettering. `size` is the cap height. */
  text(str: string, x: number, y: number, size = 0.1, align: Align = 'left', tracking = 0.12): this {
    return this.letters(LETTERING, str, x, y, size, align, tracking, false);
  }

  /** Outlined display numerals. `size` is the cap height. */
  numerals(str: string, x: number, y: number, size = 1, align: Align = 'left', tracking = 0.04): this {
    return this.letters(NUMERALS, str, x, y, size, align, tracking, true);
  }

  /** Width of a lettered string, in the units of `size`. */
  measure(str: string, size = 0.1, tracking = 0.12, set: Record<string, Letter> = LETTERING): number {
    let w = 0;
    for (const ch of str) w += ((set[ch] ?? set['0'] ?? { w: 0.6 }).w + tracking) * size;
    return w - tracking * size;
  }

  private letters(set: Record<string, Letter>, str: string, x: number, y: number, size: number, align: Align, tracking: number, closed: boolean): this {
    const width = this.measure(str, size, tracking, set);
    let ox = align === 'center' ? x - width / 2 : align === 'right' ? x - width : x;
    // letters follow each other faster than regular strokes, like a plotter writing a word
    const previousStep = this.stepSize;
    this.stepSize = Math.min(0.35, previousStep);
    this.scope(() => {
      if (!closed) this.ink({ width: Math.max(0.007, size * 0.075), dash: 0, glow: 0 });
      for (const ch of str) {
        const letter = set[ch];
        if (!letter) {
          ox += (0.6 + tracking) * size;
          continue;
        }
        this.together(() => {
          for (const s of letter.s) {
            const xy: number[] = [];
            for (let i = 0; i < s.length; i += 2) xy.push(ox + s[i] * size, y + s[i + 1] * size);
            this.path(xy, closed);
          }
        });
        ox += (letter.w + tracking) * size;
      }
    });
    this.stepSize = previousStep;
    return this;
  }

  // ── output ─────────────────────────────────────────────────────────────────
  /**
   * Resolves the timeline: each stroke gets a [t0, t1] window inside 0…1, so that a single
   * "draw" value can sweep the whole sketch while several strokes are in progress at once.
   */
  finalize(overlap = 0.24): Stroke[] {
    let last = 0;
    for (const s of this.strokes) last = Math.max(last, s.order);
    const span = Math.min(1, Math.max(overlap, 1 / (last + 1)));
    for (const s of this.strokes) {
      s.t0 = last > 0 ? (s.order / last) * (1 - span) : 0;
      s.t1 = s.t0 + span;
    }
    return this.strokes;
  }
}
