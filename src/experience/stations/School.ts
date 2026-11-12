import { Ink } from '../ink/Ink';
import { Sketch } from '../ink/sketch';
import { Station, type Frame } from './Station';

/**
 * Sheet 1 — technical school, 2015.
 * A multiview projection (front, side, top) of the kind of machine where it started,
 * drawn the way a technical-school student would: centre lines, projection lines, dimensions.
 */
export class School extends Station {
  private cursor: Ink;

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
      sk.bold(0.95).text('> hola, mundo', -1.42, 0.76, 0.082);
      sk.thin(0.6);
      const rows: [number, number][] = [[-1.42, -0.72], [-1.3, -0.5], [-1.3, -0.86], [-1.42, -1.02]];
      rows.forEach(([x0, x1], i) => sk.line(x0, 0.6 - i * 0.1, x1, 0.6 - i * 0.1));
      sk.bold(0.95).text('>', -1.42, 0.13, 0.082);
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

    // the text cursor: the first appearance of the line's colour inside a drawing
    const cursor = new Sketch();
    cursor.translate(0, 0, 0.07).ink({ width: 0.105, tone: 1, alpha: 1, glow: 0.6, dash: 0 }).line(-1.3, 0.172, -1.245, 0.172);
    this.cursor = this.addInk(cursor, { boil: 0 });
  }

  protected animate(frame: Frame, presence: number): void {
    const on = frame.motion < 0.5 || Math.floor(frame.time * 1.7) % 2 === 0;
    this.cursor.state.opacity = presence > 0.98 && on ? 1 : 0;
    this.cursor.mesh.visible = this.cursor.state.opacity > 0;
  }
}
