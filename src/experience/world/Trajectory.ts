import { CatmullRomCurve3, Group, Vector3 } from 'three/webgpu';
import { clamp, lerp } from '../../lib/math';
import { Ink } from '../ink/Ink';
import type { Stroke } from '../ink/sketch';
import { ANCHORS, FLOOR_Y, LAST_CHAPTER, RAIL_OFFSET, SHEET_COUNT } from '../layout';
import { Dots } from './Dots';

/** The points of the line that depend on the page layout; the rest follows the stations. */
export interface Route {
  /** the cursor after the name, on the cover */
  start: Vector3;
  /** the cursor on the contact sheet */
  end: Vector3;
  /** where the line passes sheets 6 and 7: in the page margin, clear of the text */
  margins: [Vector3, Vector3];
  /** two points that bring it back into the frame and up to the last cursor */
  entry: Vector3;
  approach: Vector3;
}

const SAMPLES_PER_SPAN = 26;
/** how far ahead of the visitor the pen runs, in sheets */
const LEAD = 0.1;

/**
 * The line. One continuous path from the cursor on the cover to the cursor on the
 * contact sheet: dashed where it is still planned, amber where the visitor has been.
 */
export class Trajectory {
  readonly group = new Group();
  private guide: Ink | null = null;
  private line: Ink | null = null;
  private head = new Dots(2);
  private points: Vector3[] = [];
  private fractions: number[] = []; // arc fraction of every sample
  private sheetFraction: number[] = []; // arc fraction at each sheet
  private tmp = new Vector3();

  constructor() {
    this.head.mesh.renderOrder = 5;
    this.head.set(0, 0, 0, 0, 0.62, 0, 1, 0.55).set(1, 0, 0, 0, 0.2, 0, 1, 1).commit(true);
    this.group.add(this.head.mesh);
  }

  /** (Re)builds the path between the two cursors. */
  build({ start, end, margins, entry, approach }: Route): void {
    const controls: Vector3[] = [];
    const sheetControl: number[] = new Array(SHEET_COUNT).fill(0);
    const add = (v: Vector3, sheet = -1) => {
      controls.push(v);
      if (sheet >= 0) sheetControl[sheet] = controls.length - 1;
    };
    const rail = (i: number) => {
      const p = ANCHORS[i].clone().add(RAIL_OFFSET);
      // on the last chapter the line runs on the ground, along the runway
      if (i === LAST_CHAPTER) p.set(ANCHORS[i].x, FLOOR_Y + 0.07, ANCHORS[i].z + 0.9);
      return p;
    };

    // leaves the title cursor, drops to the floor and heads for the first drawing
    add(start.clone(), 0);
    add(start.clone().add(new Vector3(1.5, -0.35, -1.8)));
    add(new Vector3(2.2, FLOOR_Y + 0.5, -8));
    for (let i = 1; i <= LAST_CHAPTER; i++) {
      if (i > 1) {
        const mid = rail(i - 1).lerp(rail(i), 0.5);
        mid.y = FLOOR_Y + 0.42;
        add(mid);
      }
      add(rail(i), i);
    }
    // rolls down the runway, rotates and climbs
    const r5 = rail(LAST_CHAPTER);
    add(r5.clone().add(new Vector3(0, 0, -8.5)));
    add(r5.clone().add(new Vector3(-0.2, 1.6, -15)));
    add(new Vector3(0.2, 9, -108));
    add(margins[0].clone(), 6);
    add(margins[1].clone(), 7);
    add(entry.clone());
    add(approach.clone());
    add(end.clone(), 8);

    const curve = new CatmullRomCurve3(controls, false, 'centripetal');
    const spans = controls.length - 1;
    this.points = curve.getPoints(spans * SAMPLES_PER_SPAN);

    // arc-length bookkeeping
    const cumulative = [0];
    for (let i = 1; i < this.points.length; i++) cumulative.push(cumulative[i - 1] + this.points[i].distanceTo(this.points[i - 1]));
    const total = cumulative[cumulative.length - 1] || 1;
    this.fractions = cumulative.map((c) => c / total);
    this.sheetFraction = sheetControl.map((c) => this.fractions[c * SAMPLES_PER_SPAN]);
    // sheets without a control of their own would map to 0; keep the list monotonic
    for (let i = 1; i < SHEET_COUNT; i++) this.sheetFraction[i] = Math.max(this.sheetFraction[i], this.sheetFraction[i - 1]);

    const pts: number[] = [];
    for (const p of this.points) pts.push(p.x, p.y, p.z);
    const stroke = (pen: Partial<Stroke>): Stroke => ({ pts, closed: false, width: 0.03, tone: 0, dash: 0, alpha: 1, glow: 1, order: 0, t0: 0, t1: 1, ...pen });

    for (const ink of [this.guide, this.line]) {
      if (!ink) continue;
      this.group.remove(ink.mesh);
      ink.dispose();
    }
    this.guide = new Ink([stroke({ width: 0.011, alpha: 0.5, dash: 0.42, glow: 0.15 })], { boil: 0 });
    this.line = new Ink([stroke({ width: 0.036, tone: 1 })], { boil: 0, halo: 0.85 });
    this.guide.mesh.renderOrder = 3;
    this.line.mesh.renderOrder = 4;
    this.group.add(this.guide.mesh, this.line.mesh);
  }

  /** Arc fraction the pen has reached for a sheet coordinate. */
  fractionAt(s: number): number {
    const f = this.sheetFraction;
    if (f.length === 0) return 0;
    const c = clamp(s, 0, f.length - 1);
    const i = Math.min(Math.floor(c), f.length - 2);
    return lerp(f[i], f[i + 1], c - i);
  }

  /** World position at an arc fraction. */
  pointAt(fraction: number, out: Vector3): Vector3 {
    const f = this.fractions;
    if (f.length === 0) return out.set(0, 0, 0);
    let lo = 0;
    let hi = f.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (f[mid] <= fraction) lo = mid;
      else hi = mid;
    }
    const span = f[hi] - f[lo];
    return out.lerpVectors(this.points[lo], this.points[hi], span > 0 ? clamp((fraction - f[lo]) / span) : 0);
  }

  /** `intro` runs 0 → 1 once: the pen leaves the cursor and the planned route is ruled ahead of it. */
  update(s: number, time: number, motion: number, intro = 1): void {
    if (!this.line || !this.guide) return;
    const fraction = this.fractionAt(s + LEAD * intro);
    this.line.set(Math.max(fraction, 0.0008));
    this.guide.set(lerp(fraction, 1, intro), fraction);

    const p = this.pointAt(fraction, this.tmp);
    // at the very end the pen stops and waits, blinking like a text cursor
    const waiting = fraction > 0.9985 ? (Math.floor(time * 1.6) % 2 === 0 || motion < 0.5 ? 1 : 0.15) : 1;
    const breathe = 1 + Math.sin(time * 3.1) * 0.08 * motion;
    this.head.set(0, p.x, p.y, p.z, 0.62 * breathe, 0, 1, 0.55 * waiting).set(1, p.x, p.y, p.z, 0.2, 0, 1, waiting).commit(true);
  }

  dispose(): void {
    this.guide?.dispose();
    this.line?.dispose();
    this.head.dispose();
  }
}
