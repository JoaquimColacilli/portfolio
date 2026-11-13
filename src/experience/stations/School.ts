import { Group } from 'three/webgpu';
import { clamp, smooth } from '../../lib/math';
import type { Ink } from '../ink/Ink';
import { Sketch } from '../ink/sketch';
import { BLINK, GREEN, ICE, TWINKLE } from '../world/Dots';
import { Station, type Frame } from './Station';

/** The line being typed on the screen, and where the two prompts are. */
const TYPED = 'hola, mundo';
const LETTER = 0.082;
const PROMPT_X = -1.42;
const FIRST_LINE = 0.76;
const SECOND_LINE = 0.13;
/** One loop of the screen: type, read, clear. In seconds. */
const TYPING = 2.4;
const LOOP = 7.2;

/**
 * Sheet 1 — technical school, 2015.
 * A multiview projection (front, side, top) of the kind of machine where it started,
 * drawn the way a technical-school student would: centre lines, projection lines, dimensions.
 *
 * The screen keeps typing its first program, and now and then a paper plane crosses the
 * sheet: the first aircraft of a story that ends on a runway. After dark the monitor is
 * the only light in the room.
 */
export class School extends Station {
  private cursor: Ink;
  private typed: Ink;
  private typedStart = 0;
  private typedWidth = 0;
  private plane = new Group();
  private planeInk: Ink;

  constructor() {
    super(1);
    this.addMarker('2015');
    const sk = new Sketch();
    const cx = -0.85;

    // centre line of the front and top views
    sk.ink({ width: 0.008, alpha: 0.42, dash: 0.16, glow: 0.1 }).line(cx, 1.58, cx, -1.66);

    // ── A · front view ──
    sk.bold().rect(cx, 0.42, 1.74, 1.4, 0.09);
    sk.rect(cx, 0.5, 1.4, 1.02, 0.14);
    sk.thin(0.8).together(() => {
      sk.circle(-0.2, -0.17, 0.026);
      sk.line(-1.55, -0.17, -1.22, -0.17);
    });
    sk.bold().path([-1.1, -0.28, -1.0, -0.42, -0.7, -0.42, -0.6, -0.28]);
    sk.rect(cx, -0.48, 1.0, 0.12, 0.04);

    // what was on the screen
    sk.scope(() => {
      sk.translate(0, 0, 0.07).pace(0.5);
      sk.bold(0.95).text('>', PROMPT_X, FIRST_LINE, LETTER);
      sk.thin(0.6);
      const rows: [number, number][] = [[-1.42, -0.72], [-1.3, -0.5], [-1.3, -0.86], [-1.42, -1.02]];
      rows.forEach(([x0, x1], i) => sk.line(x0, 0.6 - i * 0.1, x1, 0.6 - i * 0.1));
      sk.bold(0.95).text('>', PROMPT_X, SECOND_LINE, LETTER);
    });

    // ── B · side view ──
    sk.pace(1).bold().path([0.95, 1.12, 1.3, 1.12, 2.05, 0.82, 2.05, 0.02, 1.3, -0.28, 0.95, -0.28], true);
    sk.thin(0.8).ellipse(0.95, 0.42, 0.06, 0.56, Math.PI / 2, (Math.PI * 3) / 2);
    sk.thin(0.5).hatch(1.74, 0.42, 0.34, 0.52, 0.075);
    sk.bold().path([1.2, -0.28, 1.27, -0.42, 1.63, -0.42, 1.7, -0.28]);
    sk.rect(1.45, -0.48, 0.96, 0.12, 0.04);

    // projection lines between the views
    sk.dashed(0.45, 0.09).together(() => {
      sk.line(0.08, 1.12, 0.9, 1.12);
      sk.line(0.08, -0.28, 0.9, -0.28);
      sk.line(-0.3, -0.54, 0.92, -0.54);
    });

    // ── C · top view of the keyboard ──
    sk.bold().rect(cx, -1.14, 1.74, 0.58, 0.05);
    sk.thin(0.75).pace(0.6);
    for (let row = 0; row < 3; row++) {
      sk.together(() => {
        for (let k = 0; k < 12; k++) sk.rect(cx - 0.726 + k * 0.132, -0.96 - row * 0.115, 0.1, 0.082, 0.012);
      });
    }
    sk.together(() => {
      sk.rect(cx, -1.32, 0.74, 0.078, 0.02);
      sk.rect(cx - 0.6, -1.32, 0.22, 0.078, 0.012);
      sk.rect(cx + 0.6, -1.32, 0.22, 0.078, 0.012);
    });

    // dimensions and view markers
    sk.pace(1);
    sk.dim(-1.72, 1.12, 0.02, 1.12, 0.26, '360');
    sk.dim(2.05, -0.28, 2.05, 1.12, -0.26, '330');
    sk.dim(0.95, -0.54, 2.05, -0.54, -0.24, '390');
    const mark = (letter: string, x: number, y: number) =>
      sk.thin(0.85).together(() => {
        sk.circle(x, y, 0.105);
        sk.text(letter, x, y - 0.045, 0.09, 'center');
      });
    mark('A', -1.98, 1.42);
    mark('B', 0.82, 1.42);
    mark('C', -1.98, -0.86);
    this.addInk(sk);

    // the program itself, typed again and again
    const typed = new Sketch();
    this.typedStart = PROMPT_X + typed.measure('> ', LETTER) + LETTER * 0.12;
    this.typedWidth = typed.measure(TYPED, LETTER);
    typed.translate(0, 0, 0.07).bold(0.95).text(TYPED, this.typedStart, FIRST_LINE, LETTER);
    this.typed = this.addPart(typed, { boil: 0.002 });

    // the text cursor: the first appearance of the line's colour inside a drawing
    const cursor = new Sketch();
    cursor.ink({ width: 0.105, tone: 1, alpha: 1, glow: 0.6, dash: 0 }).line(0, 0.042, 0.055, 0.042);
    this.cursor = this.addPart(cursor, { boil: 0 });

    // a paper plane, folded from a sheet like this one
    const plane = new Sketch();
    plane.bold(0.95).path([0.2, 0, -0.16, 0.085, -0.09, 0, -0.16, -0.07], true);
    plane.thin(0.85).line(0.2, 0, -0.09, 0).path([-0.09, 0, -0.12, -0.11, -0.03, -0.035]);
    this.planeInk = this.addPart(plane, { boil: 0.002 });
    this.plane.add(this.planeInk.mesh);
    this.group.add(this.plane);

    // after dark: the glow of the screen on the desk, and the power light
    const glow = this.addLamps(2, { gate: 1, soft: 1, mode: TWINKLE });
    glow.set(0, cx, 0.5, 0.05, 3.1, 0.2, ICE, 0.3).set(1, cx, -1.1, 0.05, 2.2, 0.6, ICE, 0.13).commit(true);
    const power = this.addLamps(1, { gate: 1, mode: BLINK, speed: 1.4 });
    power.set(0, -0.2, -0.17, 0.02, 0.14, 0.3, GREEN, 1).commit(true);
    this.addBeacon();
  }

  protected animate({ time, motion }: Frame, presence: number): void {
    const ready = presence > 0.98;
    const still = motion < 0.5;

    // screen: type the line, leave it up, clear it
    const t = still ? TYPING + 1 : time % LOOP;
    const typing = clamp(t / TYPING);
    const cleared = still ? 0 : smooth(clamp((t - (LOOP - 0.9)) / 0.35));
    this.typed.set(ready ? typing : 0, cleared);
    // the cursor leads the text, then waits, blinking, on the next line
    const onFirstLine = typing < 1 || cleared > 0;
    const blink = still || Math.floor(time * 1.7) % 2 === 0;
    this.cursor.mesh.position.set(
      onFirstLine ? this.typedStart + this.typedWidth * (cleared > 0 ? 0 : typing) + 0.02 : PROMPT_X + 0.12,
      onFirstLine ? FIRST_LINE : SECOND_LINE,
      0.07,
    );
    this.cursor.state.opacity = ready && (onFirstLine || blink) ? 1 : 0;
    this.cursor.set(1, 0);

    // paper plane: one pass across the sheet every eleven seconds
    const pass = still ? -1 : ((time + 4) % 11) / 4.6;
    const flying = ready && pass >= 0 && pass <= 1;
    this.planeInk.state.opacity = flying ? smooth(clamp(pass / 0.12)) * smooth(clamp((1 - pass) / 0.12)) : 0;
    this.planeInk.set(1, 0);
    if (flying) {
      const x = -2.7 + pass * 5.5;
      const y = -1.35 + pass * 2.5 + Math.sin(pass * Math.PI * 2.2) * 0.34;
      const slope = 2.5 / 5.5 + (Math.cos(pass * Math.PI * 2.2) * 0.34 * Math.PI * 2.2) / 5.5;
      this.plane.position.set(x, y, 0.75);
      this.plane.rotation.z = Math.atan(slope);
    }
  }
}
