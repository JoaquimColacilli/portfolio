import { Sketch, TAU } from '../ink/sketch';
import { Dots } from '../world/Dots';
import { spline, Walk } from './paths';
import { Station, type Frame } from './Station';

/**
 * Sheet 4 — Almundo, 2025: the Cars and Tours verticals.
 * Above, a tour drawn on a contour map with its stops; below, a car in side elevation
 * with centre lines and wheelbase, as on a vehicle data sheet.
 */
export class Routes extends Station {
  private traveller: Dots;
  private route: Walk;
  private scratch = { x: 0, y: 0 };

  constructor() {
    super(4);
    this.addMarker('2025');
    const sk = new Sketch();

    // ── contour map ──
    const hill = (cx: number, cy: number, rings: number, r0: number, step: number, seed: number) => {
      for (let k = rings - 1; k >= 0; k--) {
        const r = r0 + k * step;
        const xy: number[] = [];
        for (let i = 0; i < 72; i++) {
          const a = (i / 72) * TAU;
          const wobble = 1 + 0.13 * Math.sin(2 * a + seed) + 0.08 * Math.sin(3 * a + seed * 1.7 + k * 0.5) + 0.04 * Math.sin(5 * a + k);
          xy.push(cx + Math.cos(a) * r * wobble * 1.32, cy + Math.sin(a) * r * wobble * 0.8);
        }
        sk.path(xy, true);
      }
    };
    sk.thin(0.42).pace(0.5);
    hill(-0.95, 0.86, 5, 0.16, 0.15, 0.6);
    hill(1.12, 1.02, 4, 0.13, 0.13, 2.4);
    hill(0.35, 0.28, 2, 0.1, 0.11, 4.1);

    // ── the tour: a route with its stops ──
    const stops: [number, number][] = [[-2.15, 0.2], [-1.45, 0.52], [-0.42, 1.2], [0.52, 0.62], [1.3, 0.52], [2.05, 1.12]];
    const routeXY = spline(stops, 16);
    this.route = new Walk(routeXY);
    sk.pace(1).ink({ width: 0.02, alpha: 1, glow: 1, tone: 0, dash: 0 }).path(routeXY);
    sk.pace(0.5);
    stops.slice(1, -1).forEach(([x, y], i) => {
      sk.bold().together(() => {
        sk.circle(x, y, 0.075);
        sk.circle(x, y, 0.02);
      });
      sk.thin(0.85).text(String(i + 1), x, y + 0.13, 0.075, 'center');
    });
    // compass and scale
    sk.pace(1).thin(0.8).together(() => {
      sk.circle(-2.02, 1.42, 0.15);
      sk.path([-2.07, 1.36, -2.02, 1.52, -1.97, 1.36]);
      sk.text('N', -2.02, 1.61, 0.07, 'center');
    });
    sk.together(() => {
      sk.line(1.35, 0.08, 2.15, 0.08);
      for (let i = 0; i <= 4; i++) sk.line(1.35 + i * 0.2, 0.08, 1.35 + i * 0.2, i % 2 === 0 ? 0.14 : 0.11);
      sk.text('50 KM', 1.75, -0.04, 0.06, 'center');
    });

    // ── car, side elevation ──
    const ground = -1.42;
    const wy = -1.14;
    const wheels = [-0.95, 0.85];
    sk.thin(0.6).line(-2.05, ground, 2.05, ground);
    sk.bold().path([
      -1.62, wy, -1.67, -0.86, -1.59, -0.63, -1.3, -0.5, -0.95, -0.23, -0.05, -0.16, 0.42, -0.24, 0.95, -0.55, 1.55, -0.67, 1.72, -0.79, 1.76, -1.02,
      1.7, wy,
    ]);
    sk.together(() => {
      sk.line(1.7, wy, wheels[1] + 0.34, wy);
      sk.circle(wheels[1], wy, 0.34, 0, Math.PI);
      sk.line(wheels[1] - 0.34, wy, wheels[0] + 0.34, wy);
      sk.circle(wheels[0], wy, 0.34, 0, Math.PI);
      sk.line(wheels[0] - 0.34, wy, -1.62, wy);
    });
    for (const x of wheels) {
      sk.bold().together(() => {
        sk.circle(x, wy, 0.28);
        sk.circle(x, wy, 0.12);
      });
    }
    sk.thin(0.8).path([-1.12, -0.52, -0.88, -0.29, -0.06, -0.24, 0.36, -0.3, 0.78, -0.56], true);
    sk.together(() => {
      sk.line(-0.3, -0.255, -0.3, -1.06);
      sk.path([0.62, -0.57, 0.66, -1.06]);
      sk.ellipse(1.6, -0.8, 0.07, 0.045);
      sk.rect(-1.6, -0.8, 0.06, 0.12, 0.02);
    });
    // wheel centre lines and wheelbase
    sk.ink({ width: 0.008, alpha: 0.42, dash: 0.14, glow: 0.1, tone: 0 }).together(() => {
      for (const x of wheels) sk.line(x, -0.72, x, -1.56);
    });
    sk.dim(wheels[0], ground, wheels[1], ground, -0.2, '2650');
    this.addInk(sk);

    // a vehicle following the tour
    this.traveller = new Dots(1, { opacity: 0 });
    this.traveller.set(0, 0, 0, 0.04, 0.16, 0, 0, 1).commit(true);
    this.group.add(this.traveller.mesh);
  }

  protected animate(frame: Frame, presence: number): void {
    const t = frame.motion > 0.5 ? (frame.time * 0.07) % 1 : 0.42;
    const p = this.route.at(t, this.scratch);
    this.traveller.move(0, p.x, p.y, 0.04).alpha(0, Math.min(1, Math.min(t, 1 - t) * 14)).commit(true);
    this.traveller.state.opacity = presence > 0.97 ? 1 : 0;
    this.traveller.mesh.visible = this.traveller.state.opacity > 0;
  }

  dispose(): void {
    super.dispose();
    this.traveller.dispose();
  }
}
