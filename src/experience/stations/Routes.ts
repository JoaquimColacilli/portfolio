import type { Ink } from '../ink/Ink';
import { Sketch, TAU } from '../ink/sketch';
import { AMBER, Dots, RED, SPARKLE, WHITE } from '../world/Dots';
import { spline, Walk } from './paths';
import { Station, type Frame } from './Station';

/**
 * Sheet 4 — Almundo, 2025: the Cars and Tours verticals.
 * Above, a tour drawn on a contour map with its stops; below, a car in side elevation
 * with centre lines and wheelbase, as on a vehicle data sheet.
 *
 * The car is on its way: the wheels turn and the road runs under it. After dark it
 * switches its headlights on, and the towns along the tour light up.
 */
export class Routes extends Station {
  private traveller: Dots;
  private spokes: Ink[] = [];
  private road: Dots;
  private beams: Ink;
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

    // wheels: spokes that turn
    for (const x of wheels) {
      const spokes = new Sketch();
      spokes.thin(0.8).together(() => {
        for (let k = 0; k < 5; k++) {
          const a = (k / 5) * TAU;
          spokes.line(Math.cos(a) * 0.12, Math.sin(a) * 0.12, Math.cos(a) * 0.28, Math.sin(a) * 0.28);
        }
      });
      const ink = this.addInk(spokes, { boil: 0 });
      ink.mesh.position.set(x, wy, 0);
      this.spokes.push(ink);
    }
    // the road: studs that run backwards under the car
    this.road = this.addLamps(14);
    for (let i = 0; i < 14; i++) this.road.set(i, 0, ground - 0.075, 0, 0.075, 0, WHITE, 0.7);
    this.road.commit(true);

    // after dark: headlights, a tail light, and the towns along the tour
    const beams = new Sketch();
    beams.ink({ width: 0.009, alpha: 0.55, dash: 0.07, glow: 0.4, tone: 0.35 }).together(() => {
      beams.line(1.68, -0.78, 2.42, -0.58);
      beams.line(1.68, -0.82, 2.42, -1.04);
    });
    this.beams = this.addPart(beams, { boil: 0.002 });
    const lamps = this.addLamps(2, { gate: 1 });
    lamps.set(0, 1.62, -0.8, 0.03, 0.3, 0.1, 0.3, 1).set(1, -1.62, -0.8, 0.03, 0.22, 0.2, RED, 1).commit(true);
    // what the headlights reach: a pool of light on the road ahead, inside the sheet
    const reach = this.addLamps(1, { gate: 1, soft: 1 });
    reach.set(0, 2.08, -0.84, 0.02, 1.15, 0.15, 0.3, 0.3).commit(true);
    const towns = this.addLamps(4 * 6, { gate: 1, mode: SPARKLE });
    stops.slice(1, -1).forEach(([x, y], i) => {
      towns.set(i * 6, x, y, 0.03, 0.26, 0.11 + i * 0.2, AMBER, 0.9);
      for (let k = 1; k < 6; k++) {
        const a = k * 2.4 + i;
        const r = 0.14 + ((k * 37 + i * 11) % 10) * 0.016;
        towns.set(i * 6 + k, x + Math.cos(a) * r * 1.3, y + Math.sin(a) * r * 0.8 - 0.02, 0.03, 0.075, (k * 0.17 + i * 0.31) % 1, 0.45, 0.85);
      }
    });
    towns.commit(true);
    this.addBeacon();

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

    // the car drives: wheels turn clockwise, the road comes towards it
    const travelled = frame.motion > 0.5 ? frame.time * 0.9 : 0;
    for (const spokes of this.spokes) spokes.mesh.rotation.z = -travelled / 0.28;
    for (let i = 0; i < this.road.count; i++) {
      const x = ((((i * 0.3 - travelled) % 4.2) + 4.2) % 4.2) - 2.1;
      this.road.move(i, x, -1.495, 0).alpha(i, 0.7 * Math.min(1, (2.1 - Math.abs(x)) * 5));
    }
    this.road.commit(true);

    // headlight beams are drawn when night falls
    this.beams.state.opacity = presence;
    this.beams.set(frame.night, 0);
  }

  dispose(): void {
    super.dispose();
    this.traveller.dispose();
  }
}
