import { PerspectiveCamera, RenderTarget, Scene, Vector3, WebGPURenderer } from 'three/webgpu';
import { clamp, damp, lerp } from '../lib/math';
import { stage } from '../lib/stage';
import { inkUniforms } from './ink/material';
import { ANCHORS, FLOOR_Y, SHEET_COUNT } from './layout';
import { Rig, type Viewport } from './Rig';
import type { Frame, Station } from './stations/Station';
import { Ambient, Finale } from './stations/Ambient';
import { Routes } from './stations/Routes';
import { School } from './stations/School';
import { Studio } from './stations/Studio';
import { Systems } from './stations/Systems';
import { Takeoff } from './stations/Takeoff';
import { Backdrop } from './world/Backdrop';
import { Dots } from './world/Dots';
import { Floor } from './world/Floor';
import { Trajectory } from './world/Trajectory';

export interface ExperienceOptions {
  reducedMotion: boolean;
  /** skip WebGPU and use the WebGL 2 backend (testing, or `?gl=webgl`) */
  forceWebGL?: boolean;
  /** never present to the canvas; frames are only produced by capture() (headless tests) */
  offscreen?: boolean;
  /** the GPU device or context was lost and this instance can no longer draw */
  onLost?: () => void;
}

/**
 * Text and drawing are stacked instead of side by side on phones and on narrow, tall or
 * very short windows. The same query lays out the text in src/styles/sheets.css.
 */
const STACKED_QUERY = '(max-width: 899.98px), (max-aspect-ratio: 105/100), (max-height: 559.98px)';

/**
 * The 3D half of the site: a WebGPU renderer (WebGL 2 when WebGPU is missing), a camera
 * that follows the scroll, and a world made only of lines and points of light.
 */
export class Experience {
  readonly backend: 'webgpu' | 'webgl2';
  private readonly scene = new Scene();
  private readonly rig = new Rig();
  private readonly backdrop = new Backdrop();
  private readonly floor = new Floor();
  private readonly trajectory = new Trajectory();
  private readonly stations: Station[] = [];
  private readonly finale = new Finale();
  private readonly dust: Dots;
  private readonly pointer = { x: 0, y: 0 };
  private viewport: Viewport = { width: 1, height: 1, stacked: false };
  private originEl: HTMLElement | null = null;
  private endEl: HTMLElement | null = null;
  private motion: number;
  /** 0 → 1 once: the line leaves the cursor on the cover */
  intro = 1;
  private pixelRatio: number;
  private slowFrames = 0;
  private disposed = false;
  private readonly offscreen: boolean;
  private readonly cleanups: (() => void)[] = [];

  static async create(canvas: HTMLCanvasElement, options: ExperienceOptions): Promise<Experience> {
    const renderer = new WebGPURenderer({
      canvas,
      antialias: false, // every primitive anti-aliases itself in the shader
      alpha: false,
      powerPreference: 'high-performance',
      forceWebGL: options.forceWebGL === true,
    });
    await renderer.init();
    return new Experience(renderer, canvas, options);
  }

  private constructor(
    private readonly renderer: WebGPURenderer,
    private readonly canvas: HTMLCanvasElement,
    options: ExperienceOptions,
  ) {
    this.backend = (renderer.backend as { isWebGPUBackend?: boolean }).isWebGPUBackend ? 'webgpu' : 'webgl2';
    this.motion = options.reducedMotion ? 0 : 1;
    this.offscreen = options.offscreen === true;
    inkUniforms.motion.value = this.motion;
    renderer.onDeviceLost = (info: { api: string; message: string; reason: string | null }) => {
      if (this.disposed || info.reason === 'destroyed') return;
      console.warn(`${info.api} device lost: ${info.message}`);
      this.disposed = true;
      options.onLost?.();
    };
    // A WebGPU implementation that rejects one of the shaders or pipelines would leave the
    // canvas blank. The first such error is treated like a lost device, so the page can
    // start again on WebGL 2.
    (renderer as unknown as { onError: (info: unknown) => void }).onError = (info) => {
      const message = typeof info === 'string' ? info : ((info as { message?: string } | null)?.message ?? 'unknown error');
      console.warn(`GPU error: ${message}`);
      if (this.backend !== 'webgpu' || this.disposed) return;
      this.disposed = true;
      options.onLost?.();
    };

    const small = Math.min(window.innerWidth, window.innerHeight) < 720;
    const modest = (navigator.hardwareConcurrency ?? 8) <= 4;
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, small || modest ? 1.5 : 2);

    this.scene.backgroundNode = this.backdrop.node;
    this.scene.add(this.floor.mesh, this.trajectory.group);

    this.stations = [new School(), new Studio(), new Systems(), new Routes(), new Takeoff(), new Ambient(6, 'dial'), new Ambient(7, 'hexagons'), this.finale];
    for (const station of this.stations) this.scene.add(station.group);

    this.dust = this.createDust(small || modest ? 700 : 1500);
    this.scene.add(this.dust.mesh);

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onPointer, { passive: true });
    this.cleanups.push(() => window.removeEventListener('pointermove', onPointer));

    this.resize();
  }

  /** The two cursors the line runs between: after the name on the cover, and on the contact sheet. */
  setAnchors(origin: HTMLElement | null, end: HTMLElement | null): void {
    this.originEl = origin;
    this.endEl = end;
    this.rebuildTrajectory();
  }

  setReducedMotion(reduced: boolean): void {
    this.motion = reduced ? 0 : 1;
    inkUniforms.motion.value = this.motion;
  }

  /** Call when the window changes. Cheap when the canvas kept its size. */
  resize(): void {
    // the canvas is sized in CSS (100lvh), so a phone's collapsing URL bar does not resize it
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;
    if (width !== this.viewport.width || height !== this.viewport.height) {
      this.viewport = { width, height, stacked: window.matchMedia(STACKED_QUERY).matches };
      this.renderer.setPixelRatio(this.pixelRatio);
      this.renderer.setSize(width, height, false);
      this.rig.layout(this.viewport);
      this.backdrop.aspect.value = width / height;
      for (const station of this.stations) station.layout(this.viewport);
    }
    this.rebuildTrajectory();
  }

  /** Call when the page content moved (fonts, language): the line is re-anchored to the cursors. */
  refresh(): void {
    this.rebuildTrajectory();
  }

  /** Advances and draws one frame, seen from sheet coordinate `s`. */
  frame(time: number, delta: number, s = stage.s): void {
    if (this.disposed) return;
    const frame: Frame = { s, time, delta, motion: this.motion };

    this.rig.update(s, delta, time, this.pointer.x, this.pointer.y, this.motion, stage.velocity);
    const camera = this.rig.camera;
    this.floor.follow(camera.position.x, camera.position.z);
    // the grid thins out once the line has taken off
    this.floor.opacity.value = 1 - clamp((camera.position.y - 3) / 9) * 0.85;

    // the pool of light sits behind the drawing
    const { shiftX, shiftY } = this.rig.poseAt(s, scratchA, scratchB);
    const chapter = clamp(1 - Math.abs(clamp(s, 1, 5) - s) * 2) * clamp(s / 0.6);
    this.backdrop.light.value.set(0.5 + shiftX + (1 - chapter) * 0.1, 0.5 - shiftY);
    this.backdrop.lightStrength.value = damp(this.backdrop.lightStrength.value, lerp(0.38, 0.75, chapter), 4, delta);

    // haze on the horizon: find where the floor meets the sky on screen
    camera.getWorldDirection(scratchA).setY(0);
    if (scratchA.lengthSq() > 1e-6) {
      scratchA.normalize().multiplyScalar(600).add(camera.position).setY(FLOOR_Y).project(camera);
      this.backdrop.horizon.value = 0.5 - scratchA.y * 0.5;
    }
    this.backdrop.haze.value = 1 - clamp((camera.position.y - 2.5) / 7);

    this.trajectory.update(s, time, this.motion, this.intro);
    for (const station of this.stations) station.update(frame);

    if (this.offscreen) return;
    this.renderer.render(this.scene, camera);
    this.adapt(delta);
  }

  /** Drops the resolution if the device cannot hold the frame rate. */
  private adapt(delta: number): void {
    if (delta > 0.034) this.slowFrames++;
    else this.slowFrames = Math.max(0, this.slowFrames - 2);
    if (this.slowFrames > 90 && this.pixelRatio > 1) {
      this.pixelRatio = Math.max(1, this.pixelRatio - 0.5);
      this.slowFrames = 0;
      this.renderer.setPixelRatio(this.pixelRatio);
      this.renderer.setSize(this.viewport.width, this.viewport.height, false);
    }
  }

  private createDust(count: number): Dots {
    const dust = new Dots(count, { drift: 0.22, mode: 1, opacity: 0.9 });
    const random = mulberry(20260211);
    for (let i = 0; i < count; i++) {
      const t = random() * (SHEET_COUNT - 1);
      const a = ANCHORS[Math.floor(t)];
      const b = ANCHORS[Math.min(SHEET_COUNT - 1, Math.floor(t) + 1)];
      const f = t - Math.floor(t);
      const x = lerp(a.x, b.x, f) + (random() - 0.5) * 22;
      const y = lerp(a.y, b.y, f) + (random() - 0.35) * 9;
      const z = lerp(a.z, b.z, f) + (random() - 0.5) * 6 + 5;
      dust.set(i, x, y, z, 0.035 + random() * random() * 0.11, random(), 0, 0.22 + random() * 0.5);
    }
    dust.commit(true);
    dust.mesh.renderOrder = 1;
    return dust;
  }

  /**
   * World position behind a point of the screen (0…1 from the top left), as seen from a
   * sheet's viewpoint, `depth` units away from the camera.
   */
  private worldAt(x: number, y: number, sheet: number, depth: number, out = new Vector3()): Vector3 {
    probe.fov = this.rig.fov;
    probe.aspect = this.viewport.width / this.viewport.height;
    this.rig.poseAt(sheet, probe.position, scratchB);
    probe.lookAt(scratchB);
    probe.updateProjectionMatrix();
    probe.updateMatrixWorld();
    out.set(x * 2 - 1, -(y * 2 - 1), 0.5).unproject(probe);
    return out.sub(probe.position).normalize().multiplyScalar(depth).add(probe.position);
  }

  /** Centre of a DOM element in screen fractions, for the page scrolled to `scrollY`. */
  private screenOf(el: HTMLElement, scrollY: number): { x: number; y: number } {
    const rect = el.getBoundingClientRect();
    return {
      x: (rect.left + rect.width / 2) / this.viewport.width,
      y: (rect.top + window.scrollY - scrollY + rect.height / 2) / this.viewport.height,
    };
  }

  /** Lays the line out again: from one cursor to the other, around the content of this viewport. */
  private rebuildTrajectory(): void {
    const last = SHEET_COUNT - 1;
    const { width } = this.viewport;
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const from = this.originEl ? this.screenOf(this.originEl, 0) : { x: 0.55, y: 0.42 };
    const to = this.endEl ? this.screenOf(this.endEl, maxScroll) : { x: 0.6, y: 0.4 };

    // Over the last sheets the page is full of text, so the line keeps to the right
    // margin: half a gutter in from the edge.
    const sheet = this.originEl?.closest('section');
    const gutter = sheet ? Number.parseFloat(getComputedStyle(sheet).paddingLeft) : Number.NaN;
    const margin = 1 - (Number.isFinite(gutter) ? gutter : width * 0.06) / 2 / width;

    const end = this.worldAt(to.x, to.y, last, 6.4);
    this.trajectory.build({
      start: this.worldAt(from.x, from.y, 0, 5.2),
      end,
      margins: [this.worldAt(margin, 0.8, 6, 10.5), this.worldAt(margin, 0.72, 7, 10.5)],
      // it comes back in from the right and meets the last cursor from below
      entry: this.worldAt(1.12, to.y + 0.27, last, 7.4),
      approach: this.worldAt(Math.min(to.x + 0.24, margin), to.y + 0.17, last, 6.8),
    });
    this.finale.moveTo(end.x, end.y, end.z);
  }

  /** Renders one frame off-screen and returns it as a PNG data URL (used by the test tooling). */
  async capture(width = 1280, height = 800): Promise<string> {
    const target = new RenderTarget(width, height, { depthBuffer: false });
    const previous = this.renderer.getRenderTarget();
    this.renderer.setRenderTarget(target);
    this.renderer.render(this.scene, this.rig.camera);
    this.renderer.setRenderTarget(previous);
    const pixels = (await this.renderer.readRenderTargetPixelsAsync(target, 0, 0, width, height)) as Uint8Array;
    target.dispose();

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    const image = ctx.createImageData(width, height);
    const flip = this.backend === 'webgl2';
    for (let y = 0; y < height; y++) {
      const row = (flip ? height - 1 - y : y) * width * 4;
      for (let x = 0; x < width * 4; x += 4) {
        for (let c = 0; c < 3; c++) image.data[y * width * 4 + x + c] = Math.round(255 * Math.pow(pixels[row + x + c] / 255, 1 / 2.2));
        image.data[y * width * 4 + x + 3] = 255;
      }
    }
    ctx.putImageData(image, 0, 0);
    return canvas.toDataURL('image/png');
  }

  dispose(): void {
    this.disposed = true;
    for (const fn of this.cleanups) fn();
    for (const station of this.stations) station.dispose();
    this.trajectory.dispose();
    this.dust.dispose();
    this.renderer.dispose();
  }
}

const scratchA = new Vector3();
const scratchB = new Vector3();
const probe = new PerspectiveCamera();

/** Small seeded random generator, so the dust is the same on every visit. */
function mulberry(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
