import { Group, Vector3 } from 'three/webgpu';
import { clamp, lerp } from '../../lib/math';
import { Ink } from '../ink/Ink';
import { Sketch } from '../ink/sketch';
import type { Frame } from '../stations/Station';
import { BLINK, Dots, RED, STEADY, STROBE, WHITE } from './Dots';

/** Falling stars: seconds from one to the next, how long each lasts, how far away it is drawn and how long its trail is. */
const EVERY = 11;
const LASTS = 0.85;
const FAR = 70;
const TRAIL = 9;

/** The airliner: seconds to cross the sky, seconds until the next one sets off, and how far away it flies. */
const CROSSING = 60;
const PERIOD = 85;
const DISTANT = 240;

const heading = new Vector3();
const middle = new Vector3();
const origin = new Vector3();

/** A number between 0 and 1 that is always the same for the same turn. */
const chance = (turn: number, k: number): number => {
  const v = Math.sin(turn * 12.9898 + k * 78.233) * 43758.5453;
  return v - Math.floor(v);
};

const along = (azimuth: number, elevation: number, distance: number, from: Vector3, out: Vector3): Vector3 =>
  out
    .set(Math.sin(azimuth) * Math.cos(elevation), Math.sin(elevation), -Math.cos(azimuth) * Math.cos(elevation))
    .multiplyScalar(distance)
    .add(from);

/**
 * What moves in the sky after dark, on every sheet: now and then a star falls somewhere
 * in view, and every minute and a half an airliner crosses at the height of the moon,
 * too far away to be more than a point of light, its strobe and its red beacon.
 */
export class NightSky {
  readonly group = new Group();
  private readonly streak: Ink;
  private readonly cabin = new Dots(1, { mode: STEADY, gate: 1, fog: 0, minPx: 5 });
  private readonly strobe = new Dots(1, { mode: STROBE, speed: 5.2, gate: 1, fog: 0, minPx: 12 });
  private readonly beacon = new Dots(1, { mode: BLINK, speed: 3.1, gate: 1, fog: 0, minPx: 7.5 });
  private readonly airliner = [this.cabin, this.strobe, this.beacon];
  private turn = -1;

  constructor() {
    const sk = new Sketch();
    sk.ink({ width: 0.08, alpha: 0.95, glow: 1, tone: 0, dash: 0 }).line(0, 0, TRAIL, 0);
    this.streak = new Ink(sk, { boil: 0, fog: 0, opacity: 0 });
    this.streak.mesh.rotation.order = 'YXZ';
    this.cabin.set(0, 0, 0, 0, 0.4, 0, WHITE, 0.6).commit(true);
    this.strobe.set(0, 0, 0, 0, 0.4, 0, WHITE, 1).commit(true);
    this.beacon.set(0, 0, 0, 0, 0.4, 0.4, RED, 1).commit(true);
    this.group.add(this.streak.mesh);
    for (const light of this.airliner) this.group.add(light.mesh);
  }

  /** `moon` is the direction of the moon; `reach` the tangent of half the horizontal field of view. */
  update(frame: Frame, moon: Vector3, reach: number): void {
    const { camera, time, motion, night } = frame;
    const moving = motion > 0.5 && night > 0.02;
    const moonHeight = Math.asin(clamp(moon.y, -1, 1));

    // ── falling star: placed once per turn, in front of wherever the visitor is looking ──
    const turn = Math.floor(time / EVERY);
    const t = (time - turn * EVERY) / LASTS;
    const falling = moving && night > 0.5 && t < 1.4 && chance(turn, 3) > 0.2;
    if (falling && turn !== this.turn) {
      this.turn = turn;
      camera.getWorldDirection(heading);
      const azimuth = Math.atan2(heading.x, -heading.z) + (chance(turn, 0) * 1.5 - 0.95) * Math.atan(reach);
      const slope = 0.45 + chance(turn, 2) * 0.5;
      const scale = reach < 0.4 ? 0.7 : 1;
      let elevation = moonHeight + (chance(turn, 1) - 0.6) * 0.14;
      // not across the moon: a trail that would pass over it falls lower instead
      const half = ((TRAIL / FAR) * scale) / 2;
      along(azimuth + Math.cos(slope) * half, elevation - Math.sin(slope) * half, 1, origin, middle);
      if (middle.angleTo(moon) < 0.12) elevation -= 0.15;
      const { mesh } = this.streak;
      along(azimuth, elevation, FAR, camera.position, mesh.position);
      mesh.rotation.set(0, -azimuth, -slope);
      mesh.scale.setScalar(scale);
    }
    this.streak.mesh.visible = falling;
    this.streak.state.opacity = falling ? night : 0;
    this.streak.set(clamp(t * 1.25), clamp(t * 1.25 - 0.3));

    // ── airliner: one way, then back the other way on the next lap ──
    const lap = Math.floor(time / PERIOD);
    const progress = (time - lap * PERIOD) / CROSSING;
    const flying = moving && progress < 1;
    for (const light of this.airliner) light.mesh.visible = flying;
    if (!flying) return;
    const way = lap % 2 === 0 ? 1 : -1;
    const azimuth = way * lerp(-0.8, 0.8, progress);
    const height = moonHeight - 0.012;
    along(azimuth, height, DISTANT, camera.position, this.cabin.mesh.position);
    this.strobe.mesh.position.copy(this.cabin.mesh.position);
    // the beacon sits a little behind, on the tail
    along(azimuth - way * 0.0035, height + 0.001, DISTANT, camera.position, this.beacon.mesh.position);
  }

  dispose(): void {
    this.streak.dispose();
    for (const light of this.airliner) light.dispose();
  }
}
