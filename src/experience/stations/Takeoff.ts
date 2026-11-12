import { Sketch } from '../ink/sketch';
import { ANCHORS, FLOOR_Y } from '../layout';
import { Dots } from '../world/Dots';
import { Station, type Frame } from './Station';

export const RUNWAY_HALF_WIDTH = 1.25;
export const RUNWAY_START = 0.5;
export const RUNWAY_END = -17;

/**
 * Sheet 5 — Despegar, 2026. "Despegar" is Spanish for "to take off".
 * The floor becomes a runway: threshold stripes, the designator 26 and edge lights that
 * run towards the horizon. Standing over it, the plan view of an airliner and the three
 * things cross-selling puts together: a flight, a stay and a car.
 */
export class Takeoff extends Station {
  private lights: Dots;

  constructor() {
    super(5);
    const floor = FLOOR_Y - ANCHORS[5].y + 0.02;
    const sk = new Sketch();

    // ── runway, drawn on the floor ──
    sk.scope(() => {
      sk.translate(0, floor, 0).rotateX(-Math.PI / 2); // x right, y towards the horizon
      const w = RUNWAY_HALF_WIDTH;
      sk.bold(0.9).together(() => {
        sk.line(-w, -RUNWAY_START, -w, -RUNWAY_END);
        sk.line(w, -RUNWAY_START, w, -RUNWAY_END);
      });
      sk.line(-w, -RUNWAY_START, w, -RUNWAY_START);
      // threshold stripes
      sk.ink({ width: 0.012, alpha: 0.85, glow: 0.4, tone: 0, dash: 0 }).pace(0.4);
      for (let i = 0; i < 4; i++) {
        sk.together(() => {
          for (const side of [-1, 1]) sk.rect(side * (0.22 + i * 0.27), -RUNWAY_START + 0.6, 0.13, 0.78);
        });
      }
      // designator
      sk.pace(1).ink({ width: 0.014, alpha: 0.8, glow: 0.4, tone: 0, dash: 0 }).numerals('26', 0, -RUNWAY_START + 1.5, 1.05, 'center', 0.12);
      // aiming point
      sk.together(() => {
        for (const side of [-1, 1]) sk.rect(side * 0.62, 5.6, 0.36, 1.4);
      });
    });

    // pin on the line, as on the other sheets
    sk.scope(() => {
      sk.translate(RUNWAY_HALF_WIDTH + 0.45, floor + 0.07, 0.9);
      sk.ink({ width: 0.012, alpha: 0.9, glow: 0.6, tone: 0, dash: 0 }).rect(0, 0, 0.13, 0.13);
      sk.thin(0.8).text('2026', 0.14, -0.045, 0.085);
    });

    // ── airliner, plan view ──
    const cy = 0.82;
    sk.ink({ width: 0.008, alpha: 0.42, dash: 0.16, glow: 0.1, tone: 0 }).line(-2.1, cy, 1.75, cy);
    const fuselage: number[] = [-1.38, cy + 0.14, 1.02, cy + 0.14];
    for (let i = 1; i < 12; i++) {
      const a = Math.PI / 2 - (i / 12) * Math.PI;
      fuselage.push(1.02 + Math.cos(a) * 0.42, cy + Math.sin(a) * 0.14);
    }
    fuselage.push(1.02, cy - 0.14, -1.38, cy - 0.14, -1.78, cy - 0.03, -1.78, cy + 0.03);
    sk.bold().path(fuselage, true);
    for (const side of [1, -1]) {
      sk.bold().path([0.16, cy + side * 0.14, -0.56, cy + side * 0.96, -0.83, cy + side * 0.96, -0.46, cy + side * 0.14]);
      sk.path([-1.4, cy + side * 0.13, -1.7, cy + side * 0.44, -1.82, cy + side * 0.44, -1.64, cy + side * 0.1]);
      sk.thin(0.85).rect(-0.14, cy + side * 0.45, 0.3, 0.1, 0.05);
    }
    sk.thin(0.7).together(() => {
      for (let i = 0; i < 9; i++) sk.line(-0.9 + i * 0.2, cy + 0.14, -0.9 + i * 0.2, cy + 0.1);
      sk.path([1.22, cy + 0.06, 1.3, cy, 1.22, cy - 0.06]);
    });
    sk.dim(-1.78, cy - 0.96, 1.44, cy - 0.96, -0.2, '39.5 M');

    // ── flight + stay + car ──
    const tile = (x: number, y: number, draw: () => void) => {
      sk.bold(0.9).rect(x, y, 0.44, 0.44, 0.08);
      sk.scope(() => {
        sk.translate(x, y).thin(0.95);
        sk.together(draw);
      });
    };
    const tx = 2.12;
    tile(tx, 1.36, () => {
      sk.line(-0.14, 0, 0.14, 0);
      sk.path([0.02, 0, -0.05, 0.12, -0.09, 0.12, -0.05, 0]);
      sk.path([0.02, 0, -0.05, -0.12, -0.09, -0.12, -0.05, 0]);
      sk.path([-0.12, 0, -0.16, 0.06]);
    });
    tile(tx, 0.72, () => {
      sk.path([-0.14, -0.1, -0.14, 0.1]);
      sk.path([-0.14, -0.03, 0.14, -0.03, 0.14, -0.1]);
      sk.rect(-0.08, 0.025, 0.08, 0.05, 0.02);
      sk.path([-0.03, 0, 0.14, 0, 0.14, -0.03]);
    });
    tile(tx, 0.08, () => {
      sk.path([-0.15, -0.04, -0.15, 0.01, -0.09, 0.03, -0.04, 0.09, 0.06, 0.09, 0.11, 0.03, 0.15, 0.01, 0.15, -0.04, -0.15, -0.04]);
      sk.circle(-0.08, -0.05, 0.035);
      sk.circle(0.08, -0.05, 0.035);
    });
    sk.thin(0.9).pace(0.5).cross(tx, 1.04, 0.05).cross(tx, 0.4, 0.05);
    this.addInk(sk);

    // ── edge lights, running towards the horizon ──
    const perSide = 14;
    this.lights = new Dots(perSide * 2, { opacity: 0, mode: 2, speed: 3.2 });
    for (let i = 0; i < perSide; i++) {
      const z = RUNWAY_START - 0.4 - i * ((RUNWAY_START - RUNWAY_END - 0.8) / (perSide - 1));
      for (let side = 0; side < 2; side++) {
        this.lights.set(i * 2 + side, (side ? 1 : -1) * (RUNWAY_HALF_WIDTH + 0.12), floor + 0.05, z, 0.2, i / perSide, 0, 1);
      }
    }
    this.lights.commit(true);
    this.group.add(this.lights.mesh);
  }

  protected animate(_frame: Frame, presence: number): void {
    this.lights.state.opacity = presence;
    this.lights.mesh.visible = presence > 0.01;
  }

  dispose(): void {
    super.dispose();
    this.lights.dispose();
  }
}
