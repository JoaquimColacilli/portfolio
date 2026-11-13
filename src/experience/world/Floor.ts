import { Mesh, NodeMaterial, PlaneGeometry } from 'three/webgpu';
import { Fn, abs, cameraPosition, dot, exp, float, floor, fract, fwidth, length, min, mix, positionWorld, sin, smoothstep, time, uniform, vec2, vec4 } from 'three/tsl';
import { inkUniforms } from '../ink/material';
import { FLOOR_Y } from '../layout';
import { asLight } from './blend';

/**
 * The drafting grid the story stands on: 1-unit squares, heavier every 5, fading with
 * distance. After dark a small blue lamp comes on at every heavy crossing, like the
 * lights of a taxiway, and the grid itself steps back.
 */
export class Floor {
  readonly mesh: Mesh;
  readonly opacity = uniform(1);

  constructor() {
    const material = new NodeMaterial();
    const opacity = this.opacity;
    material.fragmentNode = Fn(() => {
      const p = positionWorld.xz;
      const night = inkUniforms.night;
      const grid = (scale: number) => {
        const c = p.div(scale);
        const d = abs(fract(c.sub(0.5)).sub(0.5)).div(fwidth(c));
        return float(1).sub(min(min(d.x, d.y), 1));
      };
      const distance = length(positionWorld.sub(cameraPosition));
      const fade = float(1).sub(smoothstep(9, 44, distance)).mul(smoothstep(1.5, 5, distance));
      const lines = grid(1).mul(mix(float(0.07), float(0.04), night)).add(grid(5).mul(mix(float(0.16), float(0.1), night)));

      // lamps: one per crossing of the 5-unit grid, each with its own rhythm
      const cell = p.div(5);
      const id = floor(cell.add(0.5));
      const offset = cell.sub(id).mul(5); // world units from the crossing
      const seed = fract(sin(dot(id, vec2(127.1, 311.7))).mul(43758.5453));
      const t = time.mul(inkUniforms.motion);
      const twinkle = mix(float(1), sin(t.mul(seed.mul(1.6).add(0.7)).add(seed.mul(40))).mul(0.3).add(0.7), inkUniforms.motion);
      const lit = smoothstep(seed.mul(0.6), seed.mul(0.6).add(0.3), night);
      const reach = float(1).sub(smoothstep(16, 78, distance)).mul(smoothstep(2, 6, distance));
      const lamp = exp(dot(offset, offset).mul(-70))
        .add(exp(dot(offset, offset).mul(-9)).mul(0.16))
        .mul(twinkle)
        .mul(lit)
        .mul(reach);

      const light = inkUniforms.ink.mul(lines.mul(fade)).add(inkUniforms.ice.mul(lamp).mul(0.85));
      return vec4(light.mul(opacity), 0);
    })();

    this.mesh = new Mesh(new PlaneGeometry(1, 1), asLight(material));
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.scale.setScalar(260);
    this.mesh.position.y = FLOOR_Y;
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 0;
  }

  /** Keeps the (finite) plane under the camera; snapping to the grid hides the move. */
  follow(x: number, z: number): void {
    this.mesh.position.x = Math.round(x / 5) * 5;
    this.mesh.position.z = Math.round(z / 5) * 5;
  }
}
