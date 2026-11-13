import { Mesh } from 'three/webgpu';
import { buildInkGeometry } from './geometry';
import { inkMaterial, type InkState } from './material';
import { Sketch, type Stroke } from './sketch';

/** A drawing: a set of strokes rendered as one mesh, with its own drawing progress. */
export class Ink {
  readonly mesh: Mesh;
  readonly state: InkState;

  constructor(source: Sketch | Stroke[], options: Partial<InkState> = {}) {
    const strokes = source instanceof Sketch ? source.finalize() : source;
    this.state = { draw: 1, erase: 0, opacity: 1, boil: 0.0035, width: 1, halo: 0.36, fog: 1, ...options };
    this.mesh = new Mesh(buildInkGeometry(strokes), inkMaterial());
    this.mesh.userData = this.state;
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 2;
  }

  /** Sets the pen progress and hides the mesh when nothing would be visible. */
  set(draw: number, erase = 0): this {
    this.state.draw = draw;
    this.state.erase = erase;
    this.mesh.visible = draw > 0.0005 && erase < 0.9995 && this.state.opacity > 0.001;
    return this;
  }

  dispose(): void {
    this.mesh.geometry.dispose();
  }
}
