import { Group } from 'three/webgpu';
import { ramp, smooth } from '../../lib/math';
import { Ink } from '../ink/Ink';
import { Sketch } from '../ink/sketch';
import { ANCHORS, FLOOR_Y, RAIL_OFFSET } from '../layout';
import type { Viewport } from '../Rig';

export interface Frame {
  /** sheet coordinate */
  s: number;
  time: number;
  delta: number;
  /** 0 with reduced motion, 1 otherwise */
  motion: number;
}

/**
 * A drawing that stands at one sheet. The pen draws it as the visitor approaches and
 * lifts it again, first stroke first, as they leave.
 */
export abstract class Station {
  readonly group = new Group();
  protected readonly inks: Ink[] = [];
  /** numerals and pin: visible from afar, like a distance marker */
  private marker: Ink | null = null;

  constructor(readonly index: number) {
    this.group.position.copy(ANCHORS[index]);
  }

  /** Adds a sketch whose progress follows the visitor. */
  protected addInk(sketch: Sketch, options: ConstructorParameters<typeof Ink>[1] = {}): Ink {
    const ink = new Ink(sketch, options);
    this.inks.push(ink);
    this.group.add(ink.mesh);
    return ink;
  }

  /** The year, standing behind the drawing, and the pin that ties it to the line. */
  protected addMarker(year: string): void {
    const sk = new Sketch();
    // painted on the floor behind the drawing, like the number on a runway
    sk.ink({ width: 0.014, alpha: 0.3, glow: 0.2, tone: 0, dash: 0 });
    sk.scope(() => {
      sk.translate(0, FLOOR_Y - ANCHORS[this.index].y + 0.02, -1.4).rotateX(-Math.PI / 2);
      sk.numerals(year, 0, 0, 2.5, 'center', 0.06);
    });
    sk.scope(() => {
      sk.translate(RAIL_OFFSET.x, RAIL_OFFSET.y, RAIL_OFFSET.z);
      sk.ink({ width: 0.012, alpha: 0.9, glow: 0.6 });
      sk.rect(0, 0, 0.13, 0.13);
      sk.dashed(0.5, 0.07).line(0, 0.1, 0, 0.42);
      sk.thin(0.8).text(year, 0.14, -0.045, 0.085);
    });
    this.marker = new Ink(sk, { boil: 0.002 });
    this.marker.mesh.renderOrder = 1;
    this.group.add(this.marker.mesh);
  }

  /** Called when the window changes, for drawings that adapt to the page layout. */
  layout(_viewport: Viewport): void {}

  /** How far the pen is: 0 → 1 on the way in, held while the sheet is pinned. */
  protected drawAt(s: number): number {
    return smooth(ramp(this.index - 0.8, this.index - 0.1, s));
  }

  protected eraseAt(s: number): number {
    return smooth(ramp(this.index + 0.12, this.index + 0.72, s));
  }

  update(frame: Frame): void {
    const draw = this.drawAt(frame.s);
    const erase = this.eraseAt(frame.s);
    for (const ink of this.inks) ink.set(draw, erase);
    if (this.marker) this.marker.mesh.visible = frame.s < this.index + 0.9 && frame.s > this.index - 3.2;
    this.group.visible = frame.s > this.index - 3.2 && frame.s < this.index + 0.9;
    if (this.group.visible) this.animate(frame, draw * (1 - erase));
  }

  /** Per-frame motion inside the drawing. `presence` is 1 while it is fully drawn. */
  protected animate(_frame: Frame, _presence: number): void {}

  dispose(): void {
    for (const ink of this.inks) ink.dispose();
    this.marker?.dispose();
  }
}
