import { AddEquation, CustomBlending, DoubleSide, OneFactor, OneMinusSrcAlphaFactor, type NodeMaterial } from 'three/webgpu';

/**
 * Premultiplied "light" blending shared by lines, dots and the floor grid: the alpha
 * channel says how much of the background is covered, the colour channels how much light
 * is added. One mode covers both solid ink and pure glow.
 */
export function asLight<T extends NodeMaterial>(material: T): T {
  material.transparent = true;
  material.depthTest = false;
  material.depthWrite = false;
  material.side = DoubleSide;
  material.blending = CustomBlending;
  material.blendEquation = AddEquation;
  material.blendSrc = OneFactor;
  material.blendDst = OneMinusSrcAlphaFactor;
  material.toneMapped = false;
  return material;
}
