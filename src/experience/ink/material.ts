import {
  AddEquation,
  Color,
  CustomBlending,
  DoubleSide,
  NodeMaterial,
  OneFactor,
  OneMinusSrcAlphaFactor,
  Vector2,
} from 'three/webgpu';
import {
  Fn,
  abs,
  attribute,
  cameraProjectionMatrix,
  clamp,
  cross,
  dot,
  exp,
  float,
  floor,
  fract,
  max,
  mix,
  modelViewMatrix,
  mx_noise_vec3,
  normalize,
  positionGeometry,
  smoothstep,
  step,
  time,
  uniform,
  varyingProperty,
  vec3,
  vec4,
} from 'three/tsl';
import { palette } from '../palette';

/** Values every ink mesh exposes through `mesh.userData`. */
export interface InkState {
  /** 0…1 — how much of the sketch the pen has drawn */
  draw: number;
  /** 0…1 — how much has been lifted again, from the first stroke on */
  erase: number;
  opacity: number;
  /** hand-drawn wobble, in world units */
  boil: number;
  /** multiplies every stroke width */
  width: number;
  /** glow strength around the line */
  halo: number;
  /** 1 = dissolves into the distance like everything else, 0 = seen from any distance */
  fog: number;
}

const size = new Vector2();

// Shared by every ink material: resolved once per render.
export const uPxPerUnit = uniform(1).onRenderUpdate(({ renderer, camera }) => {
  if (!renderer || !camera) return 1;
  renderer.getDrawingBufferSize(size);
  return camera.projectionMatrix.elements[5] * 0.5 * size.y;
});
export const uDpr = uniform(1).onRenderUpdate(({ renderer }) => (renderer ? Math.min(renderer.getPixelRatio(), 2) : 1));

export const inkUniforms = {
  ink: uniform(new Color(palette.ink)),
  signal: uniform(new Color(palette.signal)),
  /** distance at which lines start to dissolve into the paper, and where they are gone */
  fogNear: uniform(15),
  fogFar: uniform(42),
  /** 0 disables the hand-drawn wobble (reduced motion) */
  motion: uniform(1),
  /** 0 by day, 1 at night; eased by the Experience when the mode changes */
  night: uniform(0),
  red: uniform(new Color(palette.red)),
  green: uniform(new Color(palette.green)),
  ice: uniform(new Color(palette.ice)),
};

let shared: NodeMaterial | null = null;

/**
 * The one material behind every line of the site, written in TSL so it compiles to WGSL
 * on WebGPU and to GLSL on the WebGL 2 fallback.
 *
 * Vertex stage: expands each polyline into a camera-facing ribbon with a minimum width
 * in pixels, plus a soft margin for the glow.
 * Fragment stage: anti-aliased core, glow, dashes, and the drawing progress — each
 * stroke appears between its t0 and t1 as `draw` goes from 0 to 1, with a bright pen tip.
 */
export function inkMaterial(): NodeMaterial {
  if (shared) return shared;

  const aPrev = attribute('aPrev', 'vec3');
  const aNext = attribute('aNext', 'vec3');
  const aSide = attribute('aSide', 'float');
  const aArc = attribute('aArc', 'vec2');
  const aTiming = attribute('aTiming', 'vec4');
  const aStyle = attribute('aStyle', 'vec4');

  const state = (key: keyof InkState, fallback: number) =>
    uniform(fallback).onObjectUpdate(({ object }) => (object?.userData as Partial<InkState> | undefined)?.[key] ?? fallback);
  const uDraw = state('draw', 1);
  const uErase = state('erase', 0);
  const uOpacity = state('opacity', 1);
  const uBoil = state('boil', 0);
  const uWidth = state('width', 1);
  const uHalo = state('halo', 0.36);
  const uFog = state('fog', 1);

  // x: signed distance to the centre line (px) · y: half core width (px) · z: px per world unit
  const vShape = varyingProperty('vec3', 'vShape');
  // x: arc length · y: total length · z: fade (fog and near plane)
  const vArc = varyingProperty('vec3', 'vArc');
  // x: t0 · y: t1 · z: opacity · w: glow
  const vTiming = varyingProperty('vec4', 'vTiming');
  // x: tone · y: dash period
  const vStyle = varyingProperty('vec2', 'vStyle');

  const material = new NodeMaterial();

  material.vertexNode = Fn(() => {
    // Hand-drawn "boil": the line is redrawn a few times per second, slightly off.
    const frame = floor(time.mul(7)).mul(3.71);
    const wobble = mx_noise_vec3(positionGeometry.mul(1.6).add(vec3(frame, aStyle.w.mul(31), frame.mul(0.37))));
    const local = positionGeometry.add(wobble.mul(uBoil).mul(inkUniforms.motion));

    const p = modelViewMatrix.mul(vec4(local, 1)).xyz;
    const before = modelViewMatrix.mul(vec4(aPrev, 1)).xyz;
    const after = modelViewMatrix.mul(vec4(aNext, 1)).xyz;

    const t1 = normalize(p.sub(before));
    const t2 = normalize(after.sub(p));
    const tangent = normalize(t1.add(t2));
    const normal = normalize(cross(tangent, normalize(p)));
    const miter = float(1).div(clamp(dot(tangent, t1), 0.5, 1));

    const depth = max(p.z.negate(), 0.05);
    const pxPerUnit = uPxPerUnit.div(depth);
    const minHalf = uDpr.mul(0.62).div(pxPerUnit);
    const halfCore = max(aStyle.x.mul(uWidth).mul(0.5), minHalf);
    const haloPx = uDpr.mul(mix(float(1.5), float(7), aTiming.w));
    const halfTotal = halfCore.add(haloPx.div(pxPerUnit));

    vShape.assign(vec3(aSide.mul(halfTotal).mul(pxPerUnit), halfCore.mul(pxPerUnit), pxPerUnit));
    const fog = mix(float(1), float(1).sub(smoothstep(inkUniforms.fogNear, inkUniforms.fogFar, depth)), uFog);
    const near = smoothstep(0.35, 1.6, depth);
    vArc.assign(vec3(aArc, fog.mul(near)));
    vTiming.assign(aTiming);
    vStyle.assign(aStyle.yz);

    return cameraProjectionMatrix.mul(vec4(p.add(normal.mul(aSide).mul(halfTotal).mul(miter)), 1));
  })();

  material.fragmentNode = Fn(() => {
    const d = abs(vShape.x);
    const half = vShape.y;
    const dpr = uDpr;

    // core + glow
    const core = float(1).sub(smoothstep(half.sub(dpr.mul(0.5)), half.add(dpr.mul(0.5)), d));
    const out = max(d.sub(half), 0).div(dpr.mul(2.9));
    // after dark the lines carry more light
    const glow = exp(out.mul(out).negate()).mul(uHalo).mul(vTiming.w).mul(mix(float(1), float(1.35), inkUniforms.night));

    // drawing progress of this stroke
    const span = max(vTiming.y.sub(vTiming.x), 1e-4);
    const drawn = clamp(uDraw.sub(vTiming.x).div(span), 0, 1);
    const erased = clamp(uErase.sub(vTiming.x).div(span), 0, 1);
    const total = max(vArc.y, 1e-5);
    const u = vArc.x.div(total);
    const soft = float(1.5).div(vShape.z.mul(total)); // 1.5 px expressed in u
    const head = float(1).sub(smoothstep(drawn.sub(soft), drawn, u)).mul(step(1e-4, drawn));
    const tail = smoothstep(erased, erased.add(soft), u).mul(step(erased, 0.9999));
    const visible = head.mul(tail);

    // dashes
    const period = vStyle.y;
    const dashed = step(fract(vArc.x.div(max(period, 1e-4))), 0.56);
    const dash = mix(float(1), dashed, step(1e-4, period));

    // the pen tip glows while the stroke is being drawn
    const tipDistance = drawn.mul(total).sub(vArc.x).mul(vShape.z).div(dpr.mul(16));
    const drawing = step(1e-3, drawn).mul(step(drawn, 0.999));
    const longEnough = smoothstep(dpr.mul(24), dpr.mul(90), total.mul(vShape.z));
    const tip = exp(tipDistance.mul(tipDistance).negate()).mul(drawing).mul(exp(out.mul(out).mul(-0.5))).mul(vTiming.w).mul(longEnough);

    const tone = vStyle.x;
    const base = mix(inkUniforms.ink, inkUniforms.signal, tone);
    const strength = visible.mul(dash).mul(vTiming.z).mul(uOpacity).mul(vArc.z);
    const alpha = core.mul(strength);

    // premultiplied output: the core covers what is behind it, the glow only adds light
    const rgb = base.mul(alpha).add(base.mul(glow).mul(strength)).add(inkUniforms.signal.mul(tip).mul(uOpacity).mul(vArc.z).mul(0.9));
    return vec4(rgb, alpha);
  })();

  material.transparent = true;
  material.depthTest = false;
  material.depthWrite = false;
  material.side = DoubleSide;
  material.blending = CustomBlending;
  material.blendEquation = AddEquation;
  material.blendSrc = OneFactor;
  material.blendDst = OneMinusSrcAlphaFactor;
  material.toneMapped = false;

  shared = material;
  return material;
}
