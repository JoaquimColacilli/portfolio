import { Color, Vector2, Vector3, type Node } from 'three/webgpu';
import {
  Fn,
  abs,
  asin,
  atan,
  cross,
  dot,
  exp,
  float,
  floor,
  fract,
  length,
  mix,
  mx_noise_float,
  normalize,
  positionLocal,
  screenCoordinate,
  screenUV,
  sin,
  smoothstep,
  step,
  time,
  uniform,
  vec2,
  vec3,
} from 'three/tsl';
import { inkUniforms } from '../ink/material';
import { palette } from '../palette';
import { MOON_RADIUS } from './sky';

/** Cells per radian of the star grid: one candidate star every 2.2 degrees. */
const STAR_CELLS = 26;

/**
 * The paper: cyanotype blue with a darker vignette, an uneven wash like a hand-coated
 * print, a pool of light behind the drawing and a little grain.
 *
 * At night the same paper goes dark and the sky comes out: stars fixed to directions in
 * the world (they stay put while the camera flies), and a moon drawn the way the rest of
 * the site is drawn, as an outline with its shadow side hatched.
 */
export class Backdrop {
  /** where the light pool sits, in screen UV */
  readonly light = uniform(new Vector2(0.5, 0.45));
  readonly lightStrength = uniform(0.5);
  readonly aspect = uniform(1.6);
  /** screen UV height of the horizon, and how much haze gathers there (0 once airborne) */
  readonly horizon = uniform(0.6);
  readonly haze = uniform(1);
  /** direction of the moon, as seen from anywhere; the experience places it for each window */
  readonly moon = uniform(new Vector3(0.34, 0.2, -0.92).normalize());
  readonly node;

  constructor() {
    const paper = uniform(new Color(palette.paper));
    const deep = uniform(new Color(palette.paperDeep));
    const glow = uniform(new Color(palette.paperLight));
    const nightPaper = uniform(new Color(palette.night.paper));
    const nightDeep = uniform(new Color(palette.night.paperDeep));
    const nightGlow = uniform(new Color(palette.night.paperLight));
    const { light, lightStrength, aspect, horizon, haze, moon } = this;
    const night = inkUniforms.night;
    const hash = (p: Node<'vec2'>, k: number) => fract(sin(dot(p, vec2(127.1 + k, 311.7 - k * 2))).mul(43758.5453));

    this.node = Fn(() => {
      const uv = screenUV;
      const centred = uv.sub(vec2(0.5, 0.46)).mul(vec2(aspect.min(1.9).max(0.75), 1));
      const vignette = smoothstep(0.12, 0.98, length(centred));
      const wash = mx_noise_float(vec3(uv.mul(vec2(aspect, 1)).mul(2.1), time.mul(0.012))).mul(0.5).add(0.5);
      const base = mix(mix(paper, nightPaper, night), mix(deep, nightDeep, night), vignette.mul(0.92).add(wash.mul(0.1)).clamp(0, 1));
      const tint = mix(glow, nightGlow, night);

      const toLight = uv.sub(light).mul(vec2(aspect, 1));
      const pool = exp(dot(toLight, toLight).mul(-3.2)).mul(lightStrength);

      // haze where the floor meets the sky; below the horizon it reaches down to where the
      // grid fades out, so the floor seems to dissolve into it
      const fromHorizon = uv.y.sub(horizon);
      const spread = mix(float(70), float(110), step(0, fromHorizon));
      const band = exp(fromHorizon.mul(fromHorizon).mul(spread).negate()).mul(haze).mul(float(1).sub(vignette.mul(0.55)));

      // ── night sky ──
      const dir = normalize(positionLocal);
      const sky = smoothstep(0.0, 0.11, dir.y);

      // stars: a grid over azimuth and elevation, at most one star per cell
      const coords = vec2(atan(dir.x, dir.z.negate()), asin(dir.y.clamp(-1, 1))).mul(STAR_CELLS);
      const cell = floor(coords);
      const where = vec2(hash(cell, 0), hash(cell, 1)).mul(0.7).add(0.15);
      const size = hash(cell, 2);
      const radius = mix(float(0.02), float(0.052), size.mul(size).mul(size));
      const t = time.mul(inkUniforms.motion);
      const flicker = mix(float(1), sin(t.mul(hash(cell, 3).mul(2.4).add(0.6)).add(size.mul(50))).mul(0.3).add(0.7), inkUniforms.motion);
      const present = step(0.58, hash(cell, 4));
      const comesOut = smoothstep(size.mul(0.55), size.mul(0.55).add(0.35), night);
      const star = smoothstep(radius, radius.mul(0.3), length(fract(coords).sub(where)))
        .mul(present)
        .mul(size.mul(0.7).add(0.3))
        .mul(flicker)
        .mul(comesOut)
        .mul(sky);

      // moon: outline, terminator and a hatched shadow side, in a frame around its direction
      const right = normalize(cross(moon, vec3(0, 1, 0)));
      const up = cross(right, moon);
      const offset = dir.sub(moon);
      const m = vec2(dot(offset, right), dot(offset, up));
      const r = length(m);
      // a line about 1.3 px wide, given as an angle so it is the same on every screen
      const stroke = (distance: Node<'float'>) => float(1).sub(smoothstep(0.0006, 0.0017, abs(distance)));
      const inside = float(1).sub(smoothstep(MOON_RADIUS - 0.0012, MOON_RADIUS, r));
      const fromShadow = length(m.sub(vec2(MOON_RADIUS * 0.62, MOON_RADIUS * 0.2)));
      const shadow = float(1).sub(smoothstep(MOON_RADIUS * 0.98 - 0.0012, MOON_RADIUS * 0.98, fromShadow));
      // the outline is drawn around the disc as night falls
      const turn = atan(m.y, m.x).div(6.2832).add(0.5);
      const outline = stroke(r.sub(MOON_RADIUS)).mul(step(turn, night.mul(1.35)));
      const terminator = stroke(fromShadow.sub(MOON_RADIUS * 0.98)).mul(inside).mul(0.55);
      const hatch = float(1)
        .sub(smoothstep(0.1, 0.2, abs(fract(m.x.add(m.y).mul(STAR_CELLS * 8.5)).sub(0.5))))
        .mul(shadow)
        .mul(inside)
        .mul(0.26);
      const lit = inside.mul(float(1).sub(shadow)).mul(0.2);
      const aura = exp(r.mul(r).div(MOON_RADIUS * MOON_RADIUS).mul(-0.32)).mul(0.13);
      const lunar = outline.add(terminator).add(hatch).add(lit).add(aura).mul(night).mul(smoothstep(-0.02, 0.06, dir.y));

      const grain = fract(sin(dot(screenCoordinate.xy.add(time.mul(60).floor()), vec2(12.9898, 78.233))).mul(43758.5453)).sub(0.5).mul(0.018);
      const ground = base.add(tint.mul(pool.mul(mix(float(0.34), float(0.24), night)).add(band.mul(mix(float(0.2), float(0.13), night)))));
      // no star shines through the moon
      const clear = float(1).sub(inside.mul(night));
      return ground.add(inkUniforms.ink.mul(star.mul(0.9).mul(clear).add(lunar))).add(float(grain));
    })();
  }
}
