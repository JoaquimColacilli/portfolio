import { Mesh, NodeMaterial, PlaneGeometry } from 'three/webgpu';
import { Fn, abs, cameraPosition, float, fract, fwidth, length, min, positionWorld, smoothstep, uniform, vec4 } from 'three/tsl';
import { inkUniforms } from '../ink/material';
import { FLOOR_Y } from '../layout';
import { asLight } from './blend';

/** The drafting grid the story stands on: 1-unit squares, heavier every 5, fading with distance. */
export class Floor {
  readonly mesh: Mesh;
  readonly opacity = uniform(1);

  constructor() {
    const material = new NodeMaterial();
    const opacity = this.opacity;
    material.fragmentNode = Fn(() => {
      const p = positionWorld.xz;
      const grid = (scale: number) => {
        const c = p.div(scale);
        const d = abs(fract(c.sub(0.5)).sub(0.5)).div(fwidth(c));
        return float(1).sub(min(min(d.x, d.y), 1));
      };
      const distance = length(positionWorld.sub(cameraPosition));
      const fade = float(1).sub(smoothstep(9, 44, distance)).mul(smoothstep(1.5, 5, distance));
      const light = grid(1).mul(0.07).add(grid(5).mul(0.16)).mul(fade).mul(opacity);
      return vec4(inkUniforms.ink.mul(light), 0);
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
