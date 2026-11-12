import { Color, Vector2 } from 'three/webgpu';
import { Fn, dot, exp, float, fract, length, mix, mx_noise_float, screenCoordinate, screenUV, sin, smoothstep, step, time, uniform, vec2, vec3 } from 'three/tsl';
import { palette } from '../palette';

/**
 * The paper: cyanotype blue with a darker vignette, an uneven wash like a hand-coated
 * print, a pool of light behind the drawing and a little grain.
 */
export class Backdrop {
  /** where the light pool sits, in screen UV */
  readonly light = uniform(new Vector2(0.5, 0.45));
  readonly lightStrength = uniform(0.5);
  readonly aspect = uniform(1.6);
  /** screen UV height of the horizon, and how much haze gathers there (0 once airborne) */
  readonly horizon = uniform(0.6);
  readonly haze = uniform(1);
  readonly node;

  constructor() {
    const paper = uniform(new Color(palette.paper));
    const deep = uniform(new Color(palette.paperDeep));
    const glow = uniform(new Color(palette.paperLight));
    const { light, lightStrength, aspect, horizon, haze } = this;

    this.node = Fn(() => {
      const uv = screenUV;
      const centred = uv.sub(vec2(0.5, 0.46)).mul(vec2(aspect.min(1.9).max(0.75), 1));
      const vignette = smoothstep(0.12, 0.98, length(centred));
      const wash = mx_noise_float(vec3(uv.mul(vec2(aspect, 1)).mul(2.1), time.mul(0.012))).mul(0.5).add(0.5);
      const base = mix(paper, deep, vignette.mul(0.92).add(wash.mul(0.1)).clamp(0, 1));

      const toLight = uv.sub(light).mul(vec2(aspect, 1));
      const pool = exp(dot(toLight, toLight).mul(-3.2)).mul(lightStrength);

      // haze where the floor meets the sky; below the horizon it reaches down to where the
      // grid fades out, so the floor seems to dissolve into it
      const fromHorizon = uv.y.sub(horizon);
      const spread = mix(float(70), float(110), step(0, fromHorizon));
      const band = exp(fromHorizon.mul(fromHorizon).mul(spread).negate()).mul(haze).mul(float(1).sub(vignette.mul(0.55)));

      const grain = fract(sin(dot(screenCoordinate.xy.add(time.mul(60).floor()), vec2(12.9898, 78.233))).mul(43758.5453)).sub(0.5).mul(0.018);
      return base.add(glow.mul(pool.mul(0.34).add(band.mul(0.2)))).add(float(grain));
    })();
  }
}
