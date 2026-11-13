import { CatmullRomCurve3, Group, Quaternion, Vector3 } from 'three/webgpu';
import { lerp, ramp, smooth, smoother } from '../../lib/math';
import type { Ink } from '../ink/Ink';
import { Sketch } from '../ink/sketch';
import { ANCHORS, FLOOR_Y } from '../layout';
import { AMBER, CHASE, GREEN, RED, SPARKLE, STROBE, WHITE, type Dots } from '../world/Dots';
import { CLIMB_AT, LEAD } from '../world/Trajectory';
import { Station, type Frame } from './Station';

export const RUNWAY_HALF_WIDTH = 1.25;
export const RUNWAY_START = 0.5;
export const RUNWAY_END = -17;

const SHEET = 5;
/** Centre of the airliner on its sheet, relative to the anchor. */
const HOME = new Vector3(-0.17, 0.82, 0);
/** The airliner leaves the sheet here, joins the line at the first climb point… */
const LEAVES = SHEET + 0.06;
const JOINS = CLIMB_AT[0] - LEAD;
/** …flies it to the second, and is out of sight by the time the next sheet arrives. */
const PARTS = CLIMB_AT[1] - LEAD;
const GONE = SHEET + 0.93;
/** How much smaller it is in flight than on the sheet. */
const FLIGHT_SCALE = 0.62;

const Z = new Vector3(0, 0, 1);
const position = new Vector3();
const heading = new Vector3();
const ahead = new Vector3();
const turn = new Quaternion();
const facing = new Quaternion();
const inverse = new Quaternion();

/**
 * Sheet 5 — Despegar, 2026. "Despegar" is Spanish for "to take off".
 *
 * The floor becomes a runway, with a marshaller waving the line in and a windsock beside
 * it. Standing over it: the plan view of an airliner and the three things cross-selling
 * puts together, a flight, a stay and a car.
 *
 * When the visitor scrolls on, the airliner leaves its sheet, turns its nose up and
 * climbs with the line as its trail, straight up the middle of the view, until the next
 * sheet arrives. After dark the runway lights come on and the airliner carries its
 * navigation lights.
 */
export class Takeoff extends Station {
  private readonly sheet: Ink;
  private readonly plane: Ink;
  private readonly planeLamps: Dots[] = [];
  private readonly arms: { shoulder: Group; elbow: Group }[] = [];
  private readonly sock = new Group();
  private flight: CatmullRomCurve3 | null = null;
  private roll = Math.PI / 2;

  constructor() {
    super(SHEET);
    const floor = FLOOR_Y - ANCHORS[SHEET].y + 0.02;
    const w = RUNWAY_HALF_WIDTH;

    // ── runway, drawn on the floor ──
    const ground = new Sketch();
    ground.scope(() => {
      ground.translate(0, floor, 0).rotateX(-Math.PI / 2); // x right, y towards the horizon
      ground.bold(0.9).together(() => {
        ground.line(-w, -RUNWAY_START, -w, -RUNWAY_END);
        ground.line(w, -RUNWAY_START, w, -RUNWAY_END);
      });
      ground.line(-w, -RUNWAY_START, w, -RUNWAY_START);
      // threshold stripes
      ground.ink({ width: 0.012, alpha: 0.85, glow: 0.4, tone: 0, dash: 0 }).pace(0.4);
      for (let i = 0; i < 4; i++) {
        ground.together(() => {
          for (const side of [-1, 1]) ground.rect(side * (0.22 + i * 0.27), -RUNWAY_START + 0.6, 0.13, 0.78);
        });
      }
      // designator
      ground
        .pace(1)
        .ink({ width: 0.014, alpha: 0.8, glow: 0.4, tone: 0, dash: 0 })
        .numerals('26', 0, -RUNWAY_START + 1.5, 1.05, 'center', 0.12);
      // aiming point
      ground.together(() => {
        for (const side of [-1, 1]) ground.rect(side * 0.62, 5.6, 0.36, 1.4);
      });
    });
    // pin on the line, as on the other sheets
    ground.scope(() => {
      ground.translate(w + 0.45, floor + 0.07, 0.9);
      ground.ink({ width: 0.012, alpha: 0.9, glow: 0.6, tone: 0, dash: 0 }).rect(0, 0, 0.13, 0.13);
      ground.thin(0.8).text('2026', 0.14, -0.045, 0.085);
    });
    this.addInk(ground);

    // ── what stays on the sheet: axis, overall length, and flight + stay + car ──
    const sheet = new Sketch();
    const cy = HOME.y;
    sheet.ink({ width: 0.008, alpha: 0.42, dash: 0.16, glow: 0.1, tone: 0 }).line(-2.1, cy, 1.75, cy);
    sheet.dim(-1.78, cy - 0.96, 1.44, cy - 0.96, -0.2, '39.5 M');
    const tile = (x: number, y: number, draw: () => void) => {
      sheet.bold(0.9).rect(x, y, 0.44, 0.44, 0.08);
      sheet.scope(() => {
        sheet.translate(x, y).thin(0.95);
        sheet.together(draw);
      });
    };
    const tx = 2.12;
    tile(tx, 1.36, () => {
      sheet.line(-0.14, 0, 0.14, 0);
      sheet.path([0.02, 0, -0.05, 0.12, -0.09, 0.12, -0.05, 0]);
      sheet.path([0.02, 0, -0.05, -0.12, -0.09, -0.12, -0.05, 0]);
      sheet.path([-0.12, 0, -0.16, 0.06]);
    });
    tile(tx, 0.72, () => {
      sheet.path([-0.14, -0.1, -0.14, 0.1]);
      sheet.path([-0.14, -0.03, 0.14, -0.03, 0.14, -0.1]);
      sheet.rect(-0.08, 0.025, 0.08, 0.05, 0.02);
      sheet.path([-0.03, 0, 0.14, 0, 0.14, -0.03]);
    });
    tile(tx, 0.08, () => {
      sheet.path([-0.15, -0.04, -0.15, 0.01, -0.09, 0.03, -0.04, 0.09, 0.06, 0.09, 0.11, 0.03, 0.15, 0.01, 0.15, -0.04, -0.15, -0.04]);
      sheet.circle(-0.08, -0.05, 0.035);
      sheet.circle(0.08, -0.05, 0.035);
    });
    sheet.thin(0.9).pace(0.5).cross(tx, 1.04, 0.05).cross(tx, 0.4, 0.05);
    this.sheet = this.addPart(sheet);

    // ── the airliner, plan view, around its own centre so it can turn and fly ──
    const plane = new Sketch();
    const fuselage: number[] = [-1.21, 0.14, 1.19, 0.14];
    for (let i = 1; i < 12; i++) {
      const a = Math.PI / 2 - (i / 12) * Math.PI;
      fuselage.push(1.19 + Math.cos(a) * 0.42, Math.sin(a) * 0.14);
    }
    fuselage.push(1.19, -0.14, -1.21, -0.14, -1.61, -0.03, -1.61, 0.03);
    plane.bold().path(fuselage, true);
    for (const side of [1, -1]) {
      plane.bold().path([0.33, side * 0.14, -0.39, side * 0.96, -0.66, side * 0.96, -0.29, side * 0.14]);
      plane.path([-1.23, side * 0.13, -1.53, side * 0.44, -1.65, side * 0.44, -1.47, side * 0.1]);
      plane.thin(0.85).rect(0.03, side * 0.45, 0.3, 0.1, 0.05);
    }
    plane.thin(0.7).together(() => {
      for (let i = 0; i < 9; i++) plane.line(-0.73 + i * 0.2, 0.14, -0.73 + i * 0.2, 0.1);
      plane.path([1.39, 0.06, 1.47, 0, 1.39, -0.06]);
    });
    this.plane = this.addPart(plane);
    this.plane.mesh.position.copy(HOME);
    // navigation lights: red to port, green to starboard, a white strobe on the tail and a red beacon
    const steady = this.addLamps(2, { gate: 1 }, this.plane.mesh, false);
    steady.set(0, -0.52, 0.97, 0, 0.26, 0.1, RED, 1).set(1, -0.52, -0.97, 0, 0.26, 0.4, GREEN, 1).commit(true);
    const flashing = this.addLamps(2, { gate: 1, mode: STROBE, speed: 5.4 }, this.plane.mesh, false);
    flashing.set(0, -1.63, 0, 0, 0.34, 0.05, WHITE, 1).set(1, 0.1, 0, 0, 0.3, 0.55, RED, 0.9).commit(true);
    this.planeLamps.push(steady, flashing);

    // ── runway lights ──
    const perSide = 14;
    const along = (i: number) => RUNWAY_START - 0.4 - i * ((RUNWAY_START - RUNWAY_END - 0.8) / (perSide - 1));
    // by day a pulse runs down both edges; after dark every lamp is on and flickers
    const edgeDay = this.addLamps(perSide * 2, { mode: CHASE, speed: 3.2, gate: -1 });
    const edgeNight = this.addLamps(perSide * 2, { mode: SPARKLE, gate: 1 });
    for (let i = 0; i < perSide; i++) {
      for (let side = 0; side < 2; side++) {
        const x = (side ? 1 : -1) * (w + 0.12);
        edgeDay.set(i * 2 + side, x, floor + 0.05, along(i), 0.2, i / perSide, WHITE, 1);
        edgeNight.set(i * 2 + side, x, floor + 0.05, along(i), 0.3, (i * 0.137 + side * 0.41) % 1, 0.22, 1);
      }
    }
    edgeDay.commit(true);
    edgeNight.commit(true);
    // centre line: a pulse that runs away towards the horizon, the way the line will go
    const centre = this.addLamps(12, { mode: CHASE, speed: 3.4, gate: 1 });
    for (let i = 0; i < 12; i++) centre.set(i, 0, floor + 0.04, -1.6 - i * 1.3, 0.17, i / 12, WHITE, 0.9);
    centre.commit(true);
    // green bar at the threshold, red bar at the far end, approach-slope lights and the windsock lamp
    const fixed = this.addLamps(8 + 6 + 4 + 1, { gate: 1 });
    let n = 0;
    for (let i = 0; i < 8; i++) fixed.set(n++, -w + 0.16 + (i * (2 * w - 0.32)) / 7, floor + 0.04, -RUNWAY_START + 0.12, 0.22, 0.05 + i * 0.03, GREEN, 0.95);
    for (let i = 0; i < 6; i++) fixed.set(n++, -w + 0.2 + (i * (2 * w - 0.4)) / 5, floor + 0.04, RUNWAY_END, 0.26, 0.5 + i * 0.03, RED, 0.95);
    for (let i = 0; i < 4; i++) fixed.set(n++, -w - 0.5 - i * 0.2, floor + 0.07, -5.4, 0.24, 0.3 + i * 0.05, i < 2 ? WHITE : RED, 1);
    fixed.set(n++, w + 0.95, floor + 0.7, -4.2, 0.2, 0.8, RED, 0.9);
    fixed.commit(true);

    this.buildMarshaller(floor);
    this.buildWindsock(floor);
    this.addBeacon(0.4);
  }

  /** The two points of the climb, in the middle of the camera's view (depends on the window). */
  setFlight(first: Vector3, second: Vector3): void {
    const home = ANCHORS[SHEET].clone().add(HOME);
    const away = second.clone().sub(first).normalize();
    this.flight = new CatmullRomCurve3(
      [home, home.clone().add(new Vector3(-0.25, 1.5, -4.5)), first.clone(), second.clone(), second.clone().addScaledVector(away, 46)],
      false,
      'centripetal',
    );
  }

  /** A marshaller beside the threshold, a lit wand in each hand. */
  private buildMarshaller(floor: number): void {
    const root = new Group();
    root.position.set(-RUNWAY_HALF_WIDTH - 0.66, floor, -1.2);
    // drawn larger than life, or nobody would see who is waving
    root.scale.setScalar(1.3);
    this.group.add(root);

    const body = new Sketch();
    body.bold(0.95).circle(0, 0.5, 0.045);
    body.path([-0.07, 0.425, 0.07, 0.425, 0.05, 0.24, -0.05, 0.24], true);
    body.thin(0.9).line(-0.062, 0.34, 0.062, 0.34);
    body.bold(0.95).together(() => {
      body.path([-0.03, 0.24, -0.05, 0.01, -0.085, 0.01]);
      body.path([0.03, 0.24, 0.05, 0.01, 0.085, 0.01]);
    });
    this.addInk(body, { boil: 0.002 }, root);

    for (const side of [1, -1]) {
      const shoulder = new Group();
      shoulder.position.set(side * 0.075, 0.405, 0);
      shoulder.scale.x = side;
      const elbow = new Group();
      elbow.position.set(0.1, 0, 0);
      shoulder.add(elbow);
      root.add(shoulder);

      const upper = new Sketch();
      upper.bold(0.95).line(0, 0, 0.1, 0);
      this.addInk(upper, { boil: 0.0015 }, shoulder);
      const fore = new Sketch();
      fore.bold(0.95).line(0, 0, 0.09, 0);
      fore.signal(0.024).line(0.09, 0, 0.25, 0);
      this.addInk(fore, { boil: 0.0015 }, elbow);
      // the wands are lit after dark
      const lamp = this.addLamps(2, { gate: 1 }, elbow);
      lamp.set(0, 0.25, 0, 0, 0.2, 0.2, AMBER, 1).set(1, 0.17, 0, 0, 0.15, 0.3, AMBER, 0.7).commit(true);
      this.arms.push({ shoulder, elbow });
    }
  }

  /** A windsock on its pole, to the right of the runway. */
  private buildWindsock(floor: number): void {
    const root = new Group();
    root.position.set(RUNWAY_HALF_WIDTH + 0.95, floor, -4.2);
    this.group.add(root);
    const pole = new Sketch();
    pole.bold(0.9).line(0, 0, 0, 0.66);
    pole.thin(0.8).line(-0.07, 0, 0.07, 0);
    this.addInk(pole, { boil: 0.001 }, root);

    this.sock.position.set(0, 0.62, 0);
    root.add(this.sock);
    const sock = new Sketch();
    sock.bold(0.9).together(() => {
      sock.line(0, 0.065, 0.36, 0.028);
      sock.line(0, -0.065, 0.36, -0.028);
    });
    sock.thin(0.85).together(() => {
      for (let i = 0; i < 4; i++) {
        const x = i * 0.12;
        const half = 0.065 - (x / 0.36) * 0.037;
        sock.line(x, half, x, -half);
      }
    });
    // one band in the signal colour, as on the real thing
    sock.signal(0.018).line(0.06, 0.045, 0.06, -0.045);
    this.addInk(sock, { boil: 0.006 }, this.sock);
  }

  update(frame: Frame): void {
    super.update(frame);
    if (!this.group.visible) return;
    const { s } = frame;
    const drawn = this.drawAt(s);

    // the notes on the sheet go first, as soon as the airliner moves
    this.sheet.set(ramp(0.55, 1, drawn), smooth(ramp(SHEET + 0.04, SHEET + 0.22, s)));

    const planeDrawn = ramp(0.3, 0.8, drawn);
    const planeErased = smooth(ramp(GONE - 0.06, GONE, s));
    this.plane.set(planeDrawn, planeErased);
    const there = planeDrawn * (1 - planeErased);
    for (const lamps of this.planeLamps) {
      lamps.state.opacity = there;
      lamps.mesh.visible = there > 0.01;
    }
    this.fly(frame);
  }

  /** Places the airliner: on its sheet, on the way to the line, on the line, or flying off. */
  private fly({ s, camera, pen }: Frame): void {
    const mesh = this.plane.mesh;
    const curve = this.flight;
    if (!curve || s <= LEAVES) {
      mesh.position.copy(HOME);
      mesh.quaternion.identity();
      mesh.scale.setScalar(1);
      return;
    }

    // where along its path: it accelerates off the sheet, arrives at the line with the
    // line's own speed, rides it, then pulls away
    let u: number;
    if (s < JOINS) {
      const t = ramp(LEAVES, JOINS, s);
      const arrive = (0.25 / (PARTS - JOINS)) * ((JOINS - LEAVES) / 0.5); // slope that matches the next stretch
      u = 0.5 * ((3 - arrive) * t * t + (arrive - 2) * t * t * t);
    } else if (s < PARTS) {
      u = 0.5 + 0.25 * ramp(JOINS, PARTS, s);
    } else {
      const t = ramp(PARTS, GONE, s);
      u = 0.75 + 0.25 * (0.8 * t + 0.2 * t * t);
    }
    curve.getPoint(u, position);
    curve.getTangent(u, heading);

    // between the two climb points it sits exactly on the pen, a little ahead of the glow
    const riding = smooth(ramp(JOINS - 0.06, JOINS + 0.02, s)) * (1 - smooth(ramp(PARTS - 0.02, PARTS + 0.06, s)));
    if (riding > 0) position.lerp(ahead.copy(heading).multiplyScalar(0.72).add(pen), riding);

    // it always faces the visitor, like a drawing held up, with its nose where it is going
    inverse.copy(camera.quaternion).invert();
    heading.applyQuaternion(inverse);
    if (Math.hypot(heading.x, heading.y) > 0.08) this.roll = Math.atan2(heading.y, heading.x);
    facing.copy(camera.quaternion).multiply(turn.setFromAxisAngle(Z, this.roll));

    const off = smoother(ramp(LEAVES, LEAVES + 0.2, s));
    mesh.quaternion.identity().slerp(facing, off);
    mesh.position.copy(position).sub(this.group.position);
    mesh.scale.setScalar(lerp(1, FLIGHT_SCALE, smoother(ramp(LEAVES, JOINS, s))));
  }

  protected animate({ s, time, motion }: Frame): void {
    // marshaller: "come ahead" while the line arrives, both wands up once it is cleared to go
    const cleared = smooth(ramp(SHEET + 0.04, SHEET + 0.16, s));
    const beat = Math.sin(time * 5.4) * motion;
    const shoulder = lerp(0.3, 1.02, cleared);
    const elbow = lerp(1.3 + beat * 0.85, 0.28, cleared);
    for (const arm of this.arms) {
      arm.shoulder.rotation.z = shoulder;
      arm.elbow.rotation.z = elbow;
    }

    // windsock: it hangs a little and never stops moving
    this.sock.rotation.z = -0.2 + (Math.sin(time * 2.3) * 0.11 + Math.sin(time * 5.1 + 1) * 0.045) * motion;
  }
}
