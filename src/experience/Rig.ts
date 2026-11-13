import { CatmullRomCurve3, PerspectiveCamera, Vector3 } from 'three/webgpu';
import { clamp, damp, lerp, smooth, smoother } from '../lib/math';
import { ANCHORS, DRAWING_HEIGHT, DRAWING_WIDTH, FIRST_CHAPTER, LAST_CHAPTER, SHEET_COUNT } from './layout';

export interface Viewport {
  width: number;
  height: number;
  /** text and drawing stacked (phones, narrow windows) instead of side by side */
  stacked: boolean;
  /** px taken by the fixed header: the sky keeps its moon below this */
  top: number;
}

/** Vertical field of view in degrees: wider when the drawing has to share a tall, narrow frame. */
export const fieldOfView = (viewport: Viewport): number => (viewport.stacked ? 50 : 40);

const tmpA = new Vector3();
const tmpB = new Vector3();
const UP = new Vector3(0, 1, 0);

/**
 * The camera flies along a spline through one viewpoint per sheet. On wide screens the
 * frame is shifted so the drawing sits on the right, clear of the text column; on phones
 * it moves up instead.
 */
export class Rig {
  readonly camera = new PerspectiveCamera(40, 1, 0.1, 400);
  private eyes: Vector3[] = [];
  private targets: Vector3[] = [];
  private shiftX: number[] = [];
  private shiftY: number[] = [];
  private curve = new CatmullRomCurve3([new Vector3(), new Vector3(0, 0, -1)]);
  private viewport: Viewport = { width: 1, height: 1, stacked: false, top: 0 };
  private pointer = { x: 0, y: 0 };
  private roll = 0;
  private lastX = 0;
  private rush = 0;
  /** field of view at rest; scrolling fast opens it up a little */
  fov = 40;

  layout(viewport: Viewport): void {
    this.viewport = viewport;
    const aspect = viewport.width / viewport.height;
    const { stacked } = viewport;
    const fov = fieldOfView(viewport);
    this.fov = fov;
    this.camera.fov = fov;
    this.camera.aspect = aspect;
    const tan = Math.tan((fov * Math.PI) / 360);

    // Distance at which a chapter drawing fills its share of the frame.
    const widthShare = stacked ? 0.9 : 0.5;
    const heightShare = stacked ? 0.4 : 0.68;
    const distance = clamp(Math.max(DRAWING_WIDTH / widthShare / (2 * tan * aspect), DRAWING_HEIGHT / heightShare / (2 * tan)), 6.5, 17);

    this.eyes = [];
    this.targets = [];
    this.shiftX = [];
    this.shiftY = [];
    for (let i = 0; i < SHEET_COUNT; i++) {
      const anchor = ANCHORS[i];
      const eye = new Vector3();
      const target = new Vector3();
      let sx = 0;
      let sy = 0;
      if (i === 0) {
        // cover: look down the line as it leaves towards the horizon
        eye.set(0, 0.5, 9);
        target.set(stacked ? 0.2 : 1.0, -0.5, -12);
      } else if (i >= FIRST_CHAPTER && i <= LAST_CHAPTER) {
        // chapters: face the drawing, from slightly to one side
        const yaw = (i % 2 === 0 ? -1 : 1) * 0.16;
        eye.set(Math.sin(yaw) * distance, 0.3, Math.cos(yaw) * distance).add(anchor);
        target.copy(anchor);
        sx = stacked ? 0 : 0.215;
        // side by side the drawing sits a little high, so the floor under it clears the title block
        sy = stacked ? 0.19 : 0.05;
      } else {
        // last sheets: content takes the whole frame, the scene stays in the background
        eye.set(0, 0.6, i === SHEET_COUNT - 1 ? 8.5 : 10).add(anchor);
        target.copy(anchor);
      }
      this.eyes.push(eye);
      this.targets.push(target);
      this.shiftX.push(sx);
      this.shiftY.push(sy);
    }
    this.curve = new CatmullRomCurve3(this.eyes, false, 'catmullrom', 0.5);
    this.camera.updateProjectionMatrix();
  }

  /** Camera position and look-at for a sheet coordinate, without pointer or sway. */
  poseAt(s: number, eye: Vector3, target: Vector3): { shiftX: number; shiftY: number } {
    const last = SHEET_COUNT - 1;
    const c = clamp(s, 0, last);
    const i = Math.min(Math.floor(c), last - 1);
    const f = c - i;
    this.curve.getPoint((i + smoother(f)) / last, eye);
    // the gaze leaves for the next drawing before the body does
    target.lerpVectors(this.targets[i], this.targets[i + 1], smooth(clamp(f / 0.82)));
    const k = smooth(f);
    return { shiftX: lerp(this.shiftX[i], this.shiftX[i + 1], k), shiftY: lerp(this.shiftY[i], this.shiftY[i + 1], k) };
  }

  /** `speed` is the scroll speed in viewport heights per second. */
  update(s: number, dt: number, time: number, pointerX: number, pointerY: number, motion: number, speed = 0): void {
    const { camera, viewport } = this;

    // the faster the visitor scrolls, the wider the lens: speed reads as speed
    this.rush = damp(this.rush, smooth(clamp(Math.abs(speed) / 4)) * motion, 3.5, dt);
    camera.fov = this.fov + this.rush * 3.2;
    const { shiftX, shiftY } = this.poseAt(s, tmpA, tmpB);

    // pointer parallax, eased; none on the cover so the line stays glued to the title cursor
    const parallax = smooth(clamp(s / 0.35)) * motion;
    this.pointer.x = damp(this.pointer.x, pointerX * parallax, 3, dt);
    this.pointer.y = damp(this.pointer.y, pointerY * parallax, 3, dt);
    const sway = motion * smooth(clamp(s / 0.35));
    camera.position.copy(tmpA);
    camera.position.x += this.pointer.x * 0.55 + Math.sin(time * 0.21) * 0.07 * sway;
    camera.position.y += this.pointer.y * 0.32 + Math.sin(time * 0.17 + 1.3) * 0.05 * sway;
    camera.up.copy(UP);
    camera.lookAt(tmpB);

    // bank gently into lateral movement
    const vx = dt > 0 ? (tmpA.x - this.lastX) / dt : 0;
    this.lastX = tmpA.x;
    this.roll = damp(this.roll, clamp(vx * 0.012, -0.09, 0.09) * motion, 4, dt);
    camera.rotateZ(this.roll);

    // shift the frame so the subject sits off-centre
    if (Math.abs(shiftX) > 1e-4 || Math.abs(shiftY) > 1e-4) {
      camera.setViewOffset(viewport.width, viewport.height, -shiftX * viewport.width, shiftY * viewport.height, viewport.width, viewport.height);
    } else {
      if (camera.view !== null && camera.view.enabled) camera.clearViewOffset();
      camera.updateProjectionMatrix();
    }
    camera.updateMatrixWorld();
  }
}
