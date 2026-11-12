import { ramp, smooth } from '../../lib/math';
import { Ink } from '../ink/Ink';
import { Sketch, TAU } from '../ink/sketch';
import type { Viewport } from '../Rig';
import { Station, type Frame } from './Station';

/**
 * Sheets 6 and 7 — above the clouds. The content takes the frame, so the scene keeps to
 * the background: large construction circles turning slowly, and cloud tops far below.
 */
export class Ambient extends Station {
  private dial: Ink;

  constructor(index: number, variant: 'dial' | 'hexagons') {
    super(index);
    const sk = new Sketch();
    sk.translate(0, 0, -6);
    if (variant === 'dial') {
      sk.thin(0.2).circle(0, 0, 3.1);
      sk.ink({ width: 0.009, alpha: 0.18, dash: 0.2, glow: 0.1, tone: 0 }).circle(0, 0, 4.4);
      sk.thin(0.16).circle(0, 0, 5.9);
      sk.thin(0.22).together(() => {
        for (let i = 0; i < 72; i++) {
          const a = (i / 72) * TAU;
          const r1 = i % 6 === 0 ? 4.12 : 4.26;
          sk.line(Math.cos(a) * r1, Math.sin(a) * r1, Math.cos(a) * 4.4, Math.sin(a) * 4.4);
        }
      });
    } else {
      sk.thin(0.2).ngon(0, 0, 3.2, 6, Math.PI / 6);
      sk.ink({ width: 0.009, alpha: 0.18, dash: 0.2, glow: 0.1, tone: 0 }).ngon(0, 0, 4.5, 6, Math.PI / 6);
      sk.thin(0.16).ngon(0, 0, 6, 6, Math.PI / 6);
      sk.thin(0.2).together(() => {
        for (let k = 0; k < 6; k++) {
          const a = Math.PI / 6 + (k * TAU) / 6;
          sk.line(Math.cos(a) * 3.2, Math.sin(a) * 3.2, Math.cos(a) * 6, Math.sin(a) * 6);
        }
      });
    }
    this.dial = this.addInk(sk, { boil: 0.002 });

    // cloud tops under the flight path
    const clouds = new Sketch();
    const cloud = (cx: number, cy: number, z: number, w: number) => {
      clouds.scope(() => {
        clouds.translate(cx, cy, z);
        const bumps = 5;
        const xy: number[] = [];
        for (let b = 0; b < bumps; b++) {
          const bx = -w / 2 + ((b + 0.5) / bumps) * w;
          const r = (w / bumps) * (0.62 + 0.3 * Math.sin(b * 2.1 + cx));
          for (let i = 0; i <= 10; i++) {
            const a = Math.PI - (i / 10) * Math.PI;
            xy.push(bx + Math.cos(a) * r, Math.sin(a) * r * 0.8);
          }
        }
        clouds.path(xy);
        clouds.line(-w / 2 - 0.3, 0, w / 2 + 0.3, 0);
      });
    };
    clouds.thin(0.34);
    cloud(-5.2, -4.6, -3, 3.4);
    cloud(4.6, -5.4, -5, 4.2);
    cloud(0.4, -6.2, -9, 5);
    cloud(-7.5, -7, -12, 4.4);
    cloud(7.8, -6.6, -11, 3.6);
    this.addInk(clouds, { boil: 0.003 });
  }

  /** On a phone the text has the whole frame, so the background steps further back. */
  layout(viewport: Viewport): void {
    for (const ink of this.inks) ink.state.opacity = viewport.stacked ? 0.5 : 1;
  }

  protected drawAt(s: number): number {
    return smooth(ramp(this.index - 0.75, this.index - 0.2, s));
  }

  protected animate(frame: Frame): void {
    this.dial.mesh.rotation.z = frame.time * 0.012 * frame.motion + this.index;
  }
}

/**
 * Sheet 8 — the end of the line. A registration mark closes in around the last cursor,
 * the way a drawing marks the point everything was measured from.
 */
export class Finale extends Station {
  constructor() {
    super(8);
    const sk = new Sketch();
    sk.thin(0.5).circle(0, 0, 0.42);
    sk.ink({ width: 0.009, alpha: 0.36, dash: 0.14, glow: 0.1, tone: 0 }).circle(0, 0, 0.95);
    sk.thin(0.26).circle(0, 0, 2.1);
    sk.thin(0.4).together(() => {
      sk.line(-2.6, 0, -0.55, 0);
      sk.line(0.55, 0, 2.6, 0);
      sk.line(0, -2.6, 0, -0.55);
      sk.line(0, 0.55, 0, 2.6);
    });
    sk.thin(0.3).together(() => {
      for (let i = 0; i < 36; i++) {
        const a = (i / 36) * TAU;
        sk.line(Math.cos(a) * 2.0, Math.sin(a) * 2.0, Math.cos(a) * 2.1, Math.sin(a) * 2.1);
      }
    });
    this.addInk(sk, { boil: 0.002 });
  }

  /** The mark is centred on the final cursor, which depends on the page layout. */
  moveTo(x: number, y: number, z: number): void {
    this.group.position.set(x, y, z);
  }

  protected drawAt(s: number): number {
    return smooth(ramp(this.index - 0.6, this.index - 0.05, s));
  }
}

