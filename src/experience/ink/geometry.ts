import { BufferAttribute, BufferGeometry } from 'three/webgpu';
import type { Stroke } from './sketch';

/**
 * Turns pen strokes into one ribbon mesh.
 *
 * Every point becomes two vertices (one per side of the line). The vertex shader pushes
 * them apart, facing the camera, so lines keep a readable width at any distance. Each
 * vertex carries its neighbours (for the tangent), its arc length (for drawing progress
 * and dashes) and the stroke's style.
 */
export function buildInkGeometry(strokes: Stroke[]): BufferGeometry {
  let vertexCount = 0;
  let indexCount = 0;
  for (const s of strokes) {
    const n = s.pts.length / 3 + (s.closed ? 1 : 0);
    vertexCount += n * 2;
    indexCount += (n - 1) * 6;
  }

  const position = new Float32Array(vertexCount * 3);
  const prev = new Float32Array(vertexCount * 3);
  const next = new Float32Array(vertexCount * 3);
  const side = new Float32Array(vertexCount);
  const arc = new Float32Array(vertexCount * 2); // length so far, total length
  const timing = new Float32Array(vertexCount * 4); // t0, t1, alpha, glow
  const style = new Float32Array(vertexCount * 4); // width, tone, dash, seed
  const index = vertexCount > 65535 ? new Uint32Array(indexCount) : new Uint16Array(indexCount);

  let v = 0;
  let k = 0;
  strokes.forEach((s, strokeIndex) => {
    const m = s.pts.length / 3;
    const n = m + (s.closed ? 1 : 0);
    const px = (i: number, c: number) => s.pts[(((i % m) + m) % m) * 3 + c];
    const seed = fract(Math.sin(strokeIndex * 12.9898 + 4.1414) * 43758.5453);

    // arc length
    const lengths = new Float32Array(n);
    for (let i = 1; i < n; i++) {
      lengths[i] = lengths[i - 1] + Math.hypot(px(i, 0) - px(i - 1, 0), px(i, 1) - px(i - 1, 1), px(i, 2) - px(i - 1, 2));
    }
    const total = lengths[n - 1] || 1;

    for (let i = 0; i < n; i++) {
      for (let c = 0; c < 3; c++) {
        const here = px(i, c);
        let before: number;
        let after: number;
        if (s.closed) {
          before = px(i - 1, c);
          after = px(i + 1, c);
        } else {
          // open ends extend straight on, so the cap stays perpendicular
          before = i > 0 ? px(i - 1, c) : here - (px(1, c) - here);
          after = i < n - 1 ? px(i + 1, c) : here + (here - px(i - 1, c));
        }
        for (let e = 0; e < 2; e++) {
          position[(v + e) * 3 + c] = here;
          prev[(v + e) * 3 + c] = before;
          next[(v + e) * 3 + c] = after;
        }
      }
      for (let e = 0; e < 2; e++) {
        const o = v + e;
        side[o] = e === 0 ? -1 : 1;
        arc[o * 2] = lengths[i];
        arc[o * 2 + 1] = total;
        timing[o * 4] = s.t0;
        timing[o * 4 + 1] = s.t1;
        timing[o * 4 + 2] = s.alpha;
        timing[o * 4 + 3] = s.glow;
        style[o * 4] = s.width;
        style[o * 4 + 1] = s.tone;
        style[o * 4 + 2] = s.dash;
        style[o * 4 + 3] = seed;
      }
      if (i < n - 1) {
        index[k++] = v;
        index[k++] = v + 1;
        index[k++] = v + 2;
        index[k++] = v + 1;
        index[k++] = v + 3;
        index[k++] = v + 2;
      }
      v += 2;
    }
  });

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(position, 3));
  geometry.setAttribute('aPrev', new BufferAttribute(prev, 3));
  geometry.setAttribute('aNext', new BufferAttribute(next, 3));
  geometry.setAttribute('aSide', new BufferAttribute(side, 1));
  geometry.setAttribute('aArc', new BufferAttribute(arc, 2));
  geometry.setAttribute('aTiming', new BufferAttribute(timing, 4));
  geometry.setAttribute('aStyle', new BufferAttribute(style, 4));
  geometry.setIndex(new BufferAttribute(index, 1));
  geometry.computeBoundingSphere();
  return geometry;
}

const fract = (x: number) => x - Math.floor(x);
