import { Group } from 'three/webgpu';
import { clamp, ramp, smooth } from '../../lib/math';
import { Ink } from '../ink/Ink';
import { Sketch, TAU } from '../ink/sketch';
import { fieldOfView, type Viewport } from '../Rig';
import { AMBER, CHASE, ICE, TWINKLE, type Dots } from '../world/Dots';
import { moonSpot } from '../world/sky';
import { Station, type Frame } from './Station';

/** Stars of a constellation (x, y, size) and the lines between them, as index pairs. */
interface Constellation {
  stars: [number, number, number][];
  lines: [number, number][];
}

/** The Southern Cross with its two pointers: what the night sky over Buenos Aires is known for. */
const CRUX: Constellation = {
  stars: [
    [0, -1.05, 0.26],
    [0.06, 1.0, 0.22],
    [-0.56, 0.2, 0.24],
    [0.5, 0.34, 0.18],
    [0.22, -0.26, 0.11],
    [-1.95, -0.42, 0.28],
    [-1.38, -0.2, 0.24],
  ],
  lines: [
    [0, 1],
    [2, 3],
    [5, 6],
  ],
};

/** Orion; its belt is "las Tres Marías". */
const ORION: Constellation = {
  stars: [
    [-0.62, 1.02, 0.26],
    [0.5, 0.92, 0.2],
    [-0.26, 0.07, 0.2],
    [0, 0, 0.2],
    [0.26, -0.07, 0.2],
    [-0.46, -1.02, 0.18],
    [0.62, -0.96, 0.27],
  ],
  lines: [
    [0, 2],
    [1, 4],
    [2, 3],
    [3, 4],
    [2, 5],
    [4, 6],
    [0, 1],
    [5, 6],
  ],
};

/** How far behind the anchor the sky's own drawings stand, and the things that fly. */
const SKY_DEPTH = 6;
const FLIGHT_DEPTH = 4;

/**
 * What the camera sees of a sky sheet `depth` units behind its anchor, when the visitor
 * arrives at the top of the sheet (the camera rests 10 units in front, 0.6 above).
 */
function frameAt(viewport: Viewport, depth: number) {
  const distance = 10 + depth;
  const halfHeight = distance * Math.tan((fieldOfView(viewport) * Math.PI) / 360);
  const halfWidth = (halfHeight * viewport.width) / viewport.height;
  const centreY = 0.6 - 0.06 * distance;
  return {
    halfWidth,
    halfHeight,
    /** px per world unit */
    unit: viewport.height / (2 * halfHeight),
    /** local position behind a pixel of the screen */
    at: (px: number, py: number): [number, number] => [((px / viewport.width) * 2 - 1) * halfWidth, centreY + (1 - (2 * py) / viewport.height) * halfHeight],
  };
}

/**
 * Sheets 6 and 7 — above the clouds. The content takes the frame, so the scene keeps to
 * the background: large construction circles turning slowly, and cloud tops far below.
 *
 * By day something flies past: birds over the first sheet, a balloon over the second.
 * After dark the birds are gone, the balloon's burner glows and a constellation is ruled
 * between its stars.
 */
export class Ambient extends Station {
  private dial: Ink;
  private fliers = new Group();
  private birds: Ink[] = [];
  private constellation: Constellation;
  private sky = new Group();
  private figure: Ink;
  private points: Dots;
  /** set by layout(): where things fly in this window */
  private altitude = 3.6;
  private span = 10;
  private drift = 3.3;

  constructor(index: number, variant: 'dial' | 'hexagons') {
    super(index);
    const sk = new Sketch();
    sk.translate(0, 0, -6);
    if (variant === 'dial') {
      sk.thin(0.2).circle(0, 0, 3.1);
      sk.ink({ width: 0.009, alpha: 0.18, dash: 0.2, glow: 0.1, tone: 0 }).circle(0, 0, 4.4);
      sk.thin(0.16).circle(0, 0, 5.9);
      sk.thin(0.22).together(() => {
        for (let i = 0; i < 72; i++) {
          const a = (i / 72) * TAU;
          const r1 = i % 6 === 0 ? 4.12 : 4.26;
          sk.line(Math.cos(a) * r1, Math.sin(a) * r1, Math.cos(a) * 4.4, Math.sin(a) * 4.4);
        }
      });
    } else {
      sk.thin(0.2).ngon(0, 0, 3.2, 6, Math.PI / 6);
      sk.ink({ width: 0.009, alpha: 0.18, dash: 0.2, glow: 0.1, tone: 0 }).ngon(0, 0, 4.5, 6, Math.PI / 6);
      sk.thin(0.16).ngon(0, 0, 6, 6, Math.PI / 6);
      sk.thin(0.2).together(() => {
        for (let k = 0; k < 6; k++) {
          const a = Math.PI / 6 + (k * TAU) / 6;
          sk.line(Math.cos(a) * 3.2, Math.sin(a) * 3.2, Math.cos(a) * 6, Math.sin(a) * 6);
        }
      });
    }
    this.dial = this.addInk(sk, { boil: 0.002 });

    // cloud tops under the flight path
    const clouds = new Sketch();
    const cloud = (cx: number, cy: number, z: number, w: number) => {
      clouds.scope(() => {
        clouds.translate(cx, cy, z);
        const bumps = 5;
        const xy: number[] = [];
        for (let b = 0; b < bumps; b++) {
          const bx = -w / 2 + ((b + 0.5) / bumps) * w;
          const r = (w / bumps) * (0.62 + 0.3 * Math.sin(b * 2.1 + cx));
          for (let i = 0; i <= 10; i++) {
            const a = Math.PI - (i / 10) * Math.PI;
            xy.push(bx + Math.cos(a) * r, Math.sin(a) * r * 0.8);
          }
        }
        clouds.path(xy);
        clouds.line(-w / 2 - 0.3, 0, w / 2 + 0.3, 0);
      });
    };
    clouds.thin(0.34);
    cloud(-5.2, -4.6, -3, 3.4);
    cloud(4.6, -5.4, -5, 4.2);
    cloud(0.4, -6.2, -9, 5);
    cloud(-7.5, -7, -12, 4.4);
    cloud(7.8, -6.6, -11, 3.6);
    this.addInk(clouds, { boil: 0.003 });

    // ── something in the air ──
    this.fliers.position.set(0, 0, -4);
    this.group.add(this.fliers);
    if (variant === 'dial') {
      const flock: [number, number][] = [[0, 0], [-0.55, 0.22], [-0.62, -0.3], [-1.2, 0.05], [-1.3, 0.48]];
      for (const [x, y] of flock) {
        const bird = new Sketch();
        bird.bold(0.8).path([-0.19, 0.1, -0.1, 0.085, -0.04, 0.03, 0, 0, 0.04, 0.03, 0.1, 0.085, 0.19, 0.1]);
        const ink = this.addPart(bird, { boil: 0.001 }, this.fliers);
        ink.mesh.position.set(x, y, 0);
        this.birds.push(ink);
      }
    } else {
      const balloon = new Sketch();
      balloon.bold(0.8).ellipse(0, 0.55, 0.42, 0.5);
      balloon.thin(0.6).together(() => {
        balloon.ellipse(0, 0.55, 0.2, 0.5);
        balloon.line(0, 0.05, 0, 1.05);
      });
      balloon.thin(0.7).together(() => {
        balloon.line(-0.2, 0.1, -0.08, -0.16);
        balloon.line(0.2, 0.1, 0.08, -0.16);
      });
      balloon.bold(0.8).rect(0, -0.22, 0.17, 0.12, 0.02);
      this.addInk(balloon, { boil: 0.002 }, this.fliers);
      // the burner: at night the envelope glows like a lantern
      const burner = this.addLamps(2, { gate: 1, soft: 1, mode: TWINKLE }, this.fliers);
      burner.set(0, 0, 0.5, 0.02, 1.7, 0.1, AMBER, 0.42).set(1, 0, 0, 0.02, 0.5, 0.5, AMBER, 0.6).commit(true);
    }

    // ── the night sky's own drawing: a constellation, ruled star to star ──
    this.constellation = variant === 'dial' ? CRUX : ORION;
    const { stars, lines } = this.constellation;
    this.group.add(this.sky);
    const figure = new Sketch();
    figure.ink({ width: 0.009, alpha: 0.5, dash: 0.09, glow: 0.2, tone: 0 });
    for (const [a, b] of lines) figure.line(stars[a][0], stars[a][1], stars[b][0], stars[b][1]);
    this.figure = this.addPart(figure, { boil: 0.001 }, this.sky);
    this.points = this.addLamps(stars.length, { gate: 1, mode: TWINKLE }, this.sky);
  }

  /**
   * The sky is composed for the window: the constellation hangs beside the moon, clear of
   * the sheet's title, and whatever flies stays inside the frame. On a phone the text has
   * the whole frame, so the background steps further back.
   */
  layout(viewport: Viewport): void {
    const { width, height, stacked, top } = viewport;
    for (const ink of this.inks) ink.state.opacity = stacked ? 0.5 : 1;

    const sky = frameAt(viewport, SKY_DEPTH);
    const moon = moonSpot(viewport, 'sky');
    const { stars } = this.constellation;
    const left = Math.min(...stars.map((star) => star[0]));
    const right = Math.max(...stars.map((star) => star[0]));
    let scale = 0.5;
    let px = moon.x - moon.radius - 22 - right * scale * sky.unit;
    let py = moon.y + 6;
    if (!stacked) {
      // between the end of the title and the moon, a little below it
      const room = moon.x - moon.radius - 24 - (width * 0.56 + 24);
      scale = clamp(room / ((right - left + 0.6) * sky.unit), 0.55, 1);
      px = moon.x - moon.radius - (0.85 + right) * scale * sky.unit;
      py = moon.y + 1.3 * scale * sky.unit;
    }
    const [x, y] = sky.at(px, py);
    this.sky.position.set(x, y, -SKY_DEPTH);
    this.sky.scale.setScalar(scale);
    const glow = stacked ? 0.72 : Math.sqrt(scale);
    stars.forEach(([sx, sy, size], i) => this.points.set(i, sx, sy, 0, size * glow, i * 0.37, 0, 1));
    this.points.commit(true);

    // birds cross under the header, above the title; the balloon keeps clear of the line in the margin
    const flight = frameAt(viewport, FLIGHT_DEPTH);
    this.altitude = flight.at(0, top + height * (stacked ? 0.055 : 0.085))[1];
    this.span = flight.halfWidth + 1.9;
    this.drift = Math.min(3.3, flight.halfWidth * 0.55);
  }

  protected drawAt(s: number): number {
    return smooth(ramp(this.index - 0.75, this.index - 0.2, s));
  }

  protected animate(frame: Frame, presence: number): void {
    const { time, motion, night } = frame;
    this.dial.mesh.rotation.z = time * 0.012 * motion + this.index;

    // birds cross the sky by day and are gone by night; the balloon just drifts
    if (this.birds.length > 0) {
      // a crossing, then a few seconds of empty sky
      const lap = motion > 0.5 ? ((time * 0.3 + this.span * 0.8) % (this.span * 2 + 1.4)) - this.span : this.span * 0.3;
      this.fliers.position.set(lap, this.altitude + Math.sin(time * 0.31) * 0.2 * motion, -FLIGHT_DEPTH);
      this.birds.forEach((bird, i) => {
        bird.mesh.scale.y = motion > 0.5 ? Math.sin(time * 7.2 + i * 1.9) * 0.85 + 0.25 : 1;
        bird.state.opacity = presence * (1 - night);
        bird.set(1, 0);
      });
    } else {
      this.fliers.position.set(this.drift + Math.sin(time * 0.11) * 0.45 * motion, -0.9 + Math.sin(time * 0.27) * 0.22 * motion, -FLIGHT_DEPTH);
      this.fliers.rotation.z = Math.sin(time * 0.4) * 0.03 * motion;
    }

    // the constellation's lines are ruled as night falls
    this.figure.state.opacity = presence;
    this.figure.set(night, 0);
  }
}

/** The registration mark on the last sheet: radii of its rings, and where the arms of its cross start and end. */
export const MARK = { inner: 0.42, dashed: 0.95, ticks: 2.0, outer: 2.1, arm: [0.55, 2.6] };

/**
 * Sheet 8 — the end of the line. A registration mark closes in around the last cursor,
 * the way a drawing marks the point everything was measured from. Its dashed ring keeps
 * turning; at night a light runs round the outer one, like a beacon left on.
 */
export class Finale extends Station {
  private ring: Ink;

  constructor() {
    super(8);
    const sk = new Sketch();
    sk.thin(0.5).circle(0, 0, MARK.inner);
    sk.thin(0.26).circle(0, 0, MARK.outer);
    const [from, to] = MARK.arm;
    sk.thin(0.4).together(() => {
      sk.line(-to, 0, -from, 0);
      sk.line(from, 0, to, 0);
      sk.line(0, -to, 0, -from);
      sk.line(0, from, 0, to);
    });
    sk.thin(0.3).together(() => {
      for (let i = 0; i < 36; i++) {
        const a = (i / 36) * TAU;
        sk.line(Math.cos(a) * MARK.ticks, Math.sin(a) * MARK.ticks, Math.cos(a) * MARK.outer, Math.sin(a) * MARK.outer);
      }
    });
    this.addInk(sk, { boil: 0.002 });

    const ring = new Sketch();
    ring.ink({ width: 0.009, alpha: 0.36, dash: 0.14, glow: 0.1, tone: 0 }).circle(0, 0, MARK.dashed);
    this.ring = this.addInk(ring, { boil: 0.002 });

    // one lamp every three ticks; the pulse goes round clockwise
    const lamps = this.addLamps(12, { gate: 1, mode: CHASE, speed: 0.7 });
    for (let i = 0; i < 12; i++) {
      const a = Math.PI / 2 - (i / 12) * TAU;
      lamps.set(i, Math.cos(a) * 2.05, Math.sin(a) * 2.05, 0, 0.13, i / 12, ICE, 0.9);
    }
    lamps.commit(true);
  }

  /** The mark is centred on the final cursor, which depends on the page layout. */
  moveTo(x: number, y: number, z: number): void {
    this.group.position.set(x, y, z);
  }

  protected drawAt(s: number): number {
    return smooth(ramp(this.index - 0.6, this.index - 0.05, s));
  }

  protected animate(frame: Frame): void {
    this.ring.mesh.rotation.z = -frame.time * 0.06 * frame.motion;
  }
}

