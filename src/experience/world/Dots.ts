import { BufferAttribute, InstancedBufferAttribute, InstancedBufferGeometry, Mesh, NodeMaterial } from 'three/webgpu';
import {
  Fn,
  abs,
  attribute,
  cameraProjectionMatrix,
  exp,
  float,
  fract,
  length,
  max,
  mix,
  modelViewMatrix,
  positionGeometry,
  pow,
  sin,
  smoothstep,
  step,
  time,
  uniform,
  varyingProperty,
  vec3,
  vec4,
} from 'three/tsl';
import { inkUniforms, uDpr, uPxPerUnit } from '../ink/material';
import { asLight } from './blend';

/** How a group of lights behaves over time. */
export const STEADY = 0;
export const TWINKLE = 1;
/** a pulse that runs from light to light, in order of phase */
export const CHASE = 2;
/** lively, irregular flicker: lamps seen through moving air */
export const SPARKLE = 3;
/** slow on and off, like an obstruction light */
export const BLINK = 4;
/** short flash, in order of phase */
export const STROBE = 5;

/** Lamp colours, passed as `tone`. Values in between mix neighbours (0.5 = pale amber). */
export const WHITE = 0;
export const AMBER = 1;
export const RED = 2;
export const GREEN = 3;
export const ICE = 4;

export interface DotsState {
  opacity: number;
  /** how far dots wander around their position, world units */
  drift: number;
  /** STEADY, TWINKLE, CHASE, SPARKLE, BLINK or STROBE */
  mode: number;
  /** pulse speed for CHASE, BLINK and STROBE */
  speed: number;
  /** 0 = always on · 1 = on at night only, coming on one by one · -1 = on by day only */
  gate: number;
  /** 1 = dissolves into the distance like the ink · 0 = seen from any distance */
  fog: number;
  /** smallest size on screen in px, so distant lamps do not vanish between pixels */
  minPx: number;
  /** 1 = a pool of light without a bright centre (a lit screen, a lamp's reach) */
  soft: number;
}

let shared: NodeMaterial | null = null;

function dotsMaterial(): NodeMaterial {
  if (shared) return shared;
  const aOffset = attribute('aOffset', 'vec3');
  // x: size (world units) · y: phase 0…1 · z: tone · w: alpha
  const aParams = attribute('aParams', 'vec4');

  const state = (key: keyof DotsState, fallback: number) =>
    uniform(fallback).onObjectUpdate(({ object }) => (object?.userData as Partial<DotsState> | undefined)?.[key] ?? fallback);
  const uOpacity = state('opacity', 1);
  const uDrift = state('drift', 0);
  const uMode = state('mode', 0);
  const uSpeed = state('speed', 1);
  const uGate = state('gate', 0);
  const uFog = state('fog', 1);
  const uMinPx = state('minPx', 0);
  const uSoft = state('soft', 0);

  const vUv = varyingProperty('vec2', 'vDotUv');
  // x: tone · y: brightness · z: 1 for a soft pool
  const vLook = varyingProperty('vec3', 'vDotLook');

  const material = new NodeMaterial();
  material.vertexNode = Fn(() => {
    const phase = aParams.y.mul(6.2831);
    const t = time.mul(inkUniforms.motion);
    const wander = vec3(sin(t.mul(0.31).add(phase)), sin(t.mul(0.23).add(phase.mul(1.7))), sin(t.mul(0.19).add(phase.mul(2.3)))).mul(uDrift);
    const centre = modelViewMatrix.mul(vec4(aOffset.add(wander), 1)).xyz;
    const depth = max(centre.z.negate(), 0.05);

    // one curve per mode; the mesh's mode picks which one applies
    const is = (mode: number) => float(1).sub(abs(uMode.sub(mode)).clamp(0, 1));
    const twinkle = sin(t.mul(0.9).add(phase)).mul(0.35).add(0.65);
    const chase = pow(max(sin(t.mul(uSpeed).sub(phase)), 0), 6).mul(0.9).add(0.1);
    const sparkle = sin(t.mul(aParams.y.mul(7).add(4.1)).add(phase.mul(9)))
      .mul(sin(t.mul(1.3).add(phase.mul(3))))
      .mul(0.34)
      .add(0.66);
    const blink = smoothstep(0.2, 0.55, sin(t.mul(uSpeed).add(phase))).mul(0.92).add(0.08);
    const strobe = pow(max(sin(t.mul(uSpeed).sub(phase)), 0), 48);
    const moving = is(STEADY)
      .add(twinkle.mul(is(TWINKLE)))
      .add(chase.mul(is(CHASE)))
      .add(sparkle.mul(is(SPARKLE)))
      .add(blink.mul(is(BLINK)))
      .add(strobe.mul(is(STROBE)));
    // with reduced motion every lamp is simply on
    const pulse = mix(float(1), moving, inkUniforms.motion);

    // night lamps come on one after another as it gets dark, and go out the same way
    const delay = fract(aParams.y.mul(7.13).add(0.37)).mul(0.62);
    const lit = smoothstep(delay, delay.add(0.3), inkUniforms.night);
    const byDay = float(1).sub(inkUniforms.night);
    const gate = mix(mix(float(1), byDay, step(uGate, -0.5)), lit, step(0.5, uGate));

    const fog = float(1).sub(smoothstep(inkUniforms.fogNear, inkUniforms.fogFar, depth));
    const fade = mix(float(1), fog, uFog).mul(smoothstep(0.4, 2.2, depth));
    const size = max(aParams.x, uMinPx.mul(uDpr).mul(depth).div(uPxPerUnit));

    vUv.assign(positionGeometry.xy.mul(2));
    vLook.assign(vec3(aParams.z, pulse.mul(gate).mul(aParams.w).mul(fade).mul(uOpacity), uSoft));
    return cameraProjectionMatrix.mul(vec4(centre.add(vec3(positionGeometry.xy.mul(size), 0)), 1));
  })();

  material.fragmentNode = Fn(() => {
    const r = length(vUv);
    const body = exp(r.mul(r).mul(mix(float(-5.5), float(-3.2), vLook.z)));
    const core = smoothstep(0.32, 0.12, r).mul(float(1).sub(vLook.z));
    const light = body.mul(0.55).add(core.mul(0.6)).mul(vLook.y).mul(smoothstep(1, 0.8, r));
    const tone = vLook.x;
    const share = (colour: number) => float(1).sub(abs(tone.sub(colour))).max(0);
    const tint = inkUniforms.ink
      .mul(share(WHITE))
      .add(inkUniforms.signal.mul(share(AMBER)))
      .add(inkUniforms.red.mul(share(RED)))
      .add(inkUniforms.green.mul(share(GREEN)))
      .add(inkUniforms.ice.mul(share(ICE)));
    return vec4(tint.mul(light), 0);
  })();

  shared = asLight(material);
  return shared;
}

/** Soft points of light: dust in the air, packets on a wire, runway lamps, beacons. */
export class Dots {
  readonly mesh: Mesh;
  readonly state: DotsState;
  readonly count: number;
  private offsets: Float32Array;
  private params: Float32Array;
  private offsetAttribute: InstancedBufferAttribute;
  private paramAttribute: InstancedBufferAttribute;

  constructor(count: number, options: Partial<DotsState> = {}) {
    this.count = count;
    this.state = { opacity: 1, drift: 0, mode: STEADY, speed: 1, gate: 0, fog: 1, minPx: 0, soft: 0, ...options };
    this.offsets = new Float32Array(count * 3);
    this.params = new Float32Array(count * 4);

    const geometry = new InstancedBufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(new Float32Array([-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0]), 3));
    geometry.setIndex([0, 1, 2, 0, 2, 3]);
    this.offsetAttribute = new InstancedBufferAttribute(this.offsets, 3);
    this.paramAttribute = new InstancedBufferAttribute(this.params, 4);
    geometry.setAttribute('aOffset', this.offsetAttribute);
    geometry.setAttribute('aParams', this.paramAttribute);
    geometry.instanceCount = count;

    this.mesh = new Mesh(geometry, dotsMaterial());
    this.mesh.userData = this.state;
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 3;
  }

  set(i: number, x: number, y: number, z: number, size: number, phase = 0, tone = 0, alpha = 1): this {
    this.offsets.set([x, y, z], i * 3);
    this.params.set([size, phase, tone, alpha], i * 4);
    return this;
  }

  move(i: number, x: number, y: number, z: number): this {
    this.offsets[i * 3] = x;
    this.offsets[i * 3 + 1] = y;
    this.offsets[i * 3 + 2] = z;
    return this;
  }

  alpha(i: number, alpha: number): this {
    this.params[i * 4 + 3] = alpha;
    return this;
  }

  /** Uploads positions (and optionally parameters) after set/move calls. */
  commit(params = false): this {
    this.offsetAttribute.needsUpdate = true;
    if (params) this.paramAttribute.needsUpdate = true;
    return this;
  }

  dispose(): void {
    this.mesh.geometry.dispose();
  }
}
