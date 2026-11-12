import { BufferAttribute, InstancedBufferAttribute, InstancedBufferGeometry, Mesh, NodeMaterial } from 'three/webgpu';
import {
  Fn,
  attribute,
  cameraProjectionMatrix,
  exp,
  float,
  length,
  max,
  mix,
  modelViewMatrix,
  positionGeometry,
  pow,
  sin,
  smoothstep,
  time,
  uniform,
  varyingProperty,
  vec2,
  vec3,
  vec4,
} from 'three/tsl';
import { inkUniforms } from '../ink/material';
import { asLight } from './blend';

export interface DotsState {
  opacity: number;
  /** how far dots wander around their position, world units */
  drift: number;
  /** 0 = steady, 1 = slow twinkle, 2 = chase pulse (runway lights) */
  mode: number;
  /** pulse speed for mode 2 */
  speed: number;
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

  const vUv = varyingProperty('vec2', 'vDotUv');
  // x: tone · y: brightness
  const vLook = varyingProperty('vec2', 'vDotLook');

  const material = new NodeMaterial();
  material.vertexNode = Fn(() => {
    const phase = aParams.y.mul(6.2831);
    const t = time.mul(inkUniforms.motion);
    const wander = vec3(sin(t.mul(0.31).add(phase)), sin(t.mul(0.23).add(phase.mul(1.7))), sin(t.mul(0.19).add(phase.mul(2.3)))).mul(uDrift);
    const centre = modelViewMatrix.mul(vec4(aOffset.add(wander), 1)).xyz;
    const depth = max(centre.z.negate(), 0.05);

    const twinkle = sin(t.mul(0.9).add(phase)).mul(0.35).add(0.65);
    const chase = pow(max(sin(t.mul(uSpeed).sub(phase)), 0), 6).mul(0.9).add(0.1);
    const pulse = mix(float(1), mix(twinkle, chase, uMode.sub(1).clamp(0, 1)), uMode.clamp(0, 1));

    const fog = float(1).sub(smoothstep(inkUniforms.fogNear, inkUniforms.fogFar, depth)).mul(smoothstep(0.4, 2.2, depth));
    vUv.assign(positionGeometry.xy.mul(2));
    vLook.assign(vec2(aParams.z, pulse.mul(aParams.w).mul(fog).mul(uOpacity)));
    return cameraProjectionMatrix.mul(vec4(centre.add(vec3(positionGeometry.xy.mul(aParams.x), 0)), 1));
  })();

  material.fragmentNode = Fn(() => {
    const r = length(vUv);
    const body = exp(r.mul(r).mul(-5.5));
    const core = smoothstep(0.32, 0.12, r);
    const light = body.mul(0.55).add(core.mul(0.6)).mul(vLook.y).mul(smoothstep(1, 0.8, r));
    const tint = mix(inkUniforms.ink, inkUniforms.signal, vLook.x);
    return vec4(tint.mul(light), 0);
  })();

  shared = asLight(material);
  return shared;
}

/** Soft points of light: dust in the air, packets on a wire, runway lamps. */
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
    this.state = { opacity: 1, drift: 0, mode: 0, speed: 1, ...options };
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
