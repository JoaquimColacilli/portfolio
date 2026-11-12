import { Group } from 'three/webgpu';
import { smooth } from '../../lib/math';
import { Ink } from '../ink/Ink';
import { Sketch } from '../ink/sketch';
import { Station, type Frame } from './Station';

/**
 * Sheet 2 — freelance work, 2021.
 * Wireframes: a landing page at desktop width, its phone layout in front and a dashboard
 * behind, each on its own depth plane, with the breakpoint widths as dimensions.
 */
export class Studio extends Station {
  private pointer = new Group();
  private ripple: Ink;

  constructor() {
    super(2);
    this.addMarker('2021');
    const sk = new Sketch();

    // ── dashboard, one plane back ──
    sk.scope(() => {
      sk.translate(-1.02, 0.86, -0.75);
      sk.bold(0.5).rect(0, 0, 2.0, 1.3, 0.06);
      sk.thin(0.4).line(-0.55, -0.65, -0.55, 0.65);
      sk.together(() => {
        for (let i = 0; i < 4; i++) sk.line(-0.9, 0.42 - i * 0.14, -0.66, 0.42 - i * 0.14);
      });
      sk.thin(0.45).path([-0.4, -0.45, -0.4, 0.4]).path([-0.4, -0.45, 0.85, -0.45]);
      sk.bold(0.55).path([-0.36, -0.3, -0.12, -0.05, 0.1, -0.16, 0.36, 0.14, 0.58, 0.06, 0.82, 0.34]);
      sk.thin(0.4).together(() => {
        for (let i = 0; i < 5; i++) sk.rect(-0.26 + i * 0.24, -0.45 + (0.1 + i * 0.035) / 2, 0.09, 0.1 + i * 0.035);
      });
    });

    // ── landing page, desktop ──
    const bx = -0.45;
    sk.bold().rect(bx, -0.05, 2.9, 2.0, 0.07);
    sk.thin(0.8).line(-1.9, 0.72, 1.0, 0.72);
    sk.together(() => {
      for (let i = 0; i < 3; i++) sk.circle(-1.77 + i * 0.1, 0.835, 0.03);
      sk.rect(bx, 0.835, 1.5, 0.11, 0.055);
    });
    sk.together(() => {
      sk.rect(-1.7, 0.55, 0.1, 0.1);
      for (let i = 0; i < 3; i++) sk.line(0.22 + i * 0.26, 0.55, 0.4 + i * 0.26, 0.55);
    });
    // headline, copy, calls to action
    sk.ink({ width: 0.05, alpha: 0.95, glow: 0.5, tone: 0, dash: 0 }).line(-1.7, 0.27, -0.72, 0.27).line(-1.7, 0.11, -0.98, 0.11);
    sk.thin(0.6).together(() => {
      sk.line(-1.7, -0.08, -0.6, -0.08);
      sk.line(-1.7, -0.17, -0.7, -0.17);
      sk.line(-1.7, -0.26, -0.98, -0.26);
    });
    sk.bold().rect(-1.45, -0.46, 0.5, 0.15, 0.075);
    sk.thin(0.8).rect(-0.88, -0.46, 0.5, 0.15, 0.075);
    // image placeholder
    sk.bold().rect(0.25, -0.02, 1.15, 0.9, 0.04);
    sk.thin(0.5).together(() => {
      sk.line(-0.325, -0.47, 0.825, 0.43);
      sk.line(-0.325, 0.43, 0.825, -0.47);
    });
    // cards
    sk.pace(0.6);
    for (let i = 0; i < 3; i++) {
      const x = -1.4 + i * 0.95;
      sk.bold(0.9).rect(x, -0.82, 0.82, 0.3, 0.03);
      sk.thin(0.6).together(() => {
        sk.rect(x - 0.28, -0.82, 0.14, 0.14);
        sk.line(x - 0.14, -0.78, x + 0.3, -0.78);
        sk.line(x - 0.14, -0.86, x + 0.16, -0.86);
      });
    }
    sk.pace(1).dim(-1.9, -1.05, 1.0, -1.05, -0.28, '1440');

    // ── the same page on a phone, one plane forward ──
    sk.scope(() => {
      sk.translate(0, 0, 0.6);
      const px = 1.78;
      sk.bold().rect(px, -0.35, 0.82, 1.66, 0.13);
      sk.thin(0.8).line(px - 0.1, 0.38, px + 0.1, 0.38);
      sk.bold(0.9).rect(px, 0.02, 0.62, 0.42, 0.03);
      sk.thin(0.5).together(() => {
        sk.line(px - 0.31, -0.19, px + 0.31, 0.23);
        sk.line(px - 0.31, 0.23, px + 0.31, -0.19);
      });
      sk.ink({ width: 0.04, alpha: 0.95, glow: 0.5, tone: 0, dash: 0 }).line(px - 0.31, -0.33, px + 0.24, -0.33).line(px - 0.31, -0.45, px + 0.05, -0.45);
      sk.thin(0.6).together(() => {
        sk.line(px - 0.31, -0.6, px + 0.31, -0.6);
        sk.line(px - 0.31, -0.68, px + 0.2, -0.68);
      });
      sk.bold().rect(px, -0.92, 0.62, 0.14, 0.07);
      sk.dim(px - 0.41, -1.18, px + 0.41, -1.18, -0.22, '390');
    });
    this.addInk(sk);

    // a pointer that keeps clicking the call to action
    const arrow = new Sketch();
    arrow.bold().path([0, 0, 0, -0.21, 0.052, -0.158, 0.09, -0.24, 0.118, -0.226, 0.08, -0.146, 0.148, -0.146], true);
    const arrowInk = new Ink(arrow, { boil: 0.0015 });
    this.inks.push(arrowInk);
    this.pointer.add(arrowInk.mesh);
    this.pointer.position.set(-1.36, -0.5, 0.25);
    this.group.add(this.pointer);

    const ring = new Sketch();
    ring.thin(0.9).circle(0, 0, 0.1);
    this.ripple = new Ink(ring, { boil: 0 });
    this.ripple.mesh.position.set(-1.36, -0.5, 0.2);
    this.group.add(this.ripple.mesh);
  }

  protected animate(frame: Frame, presence: number): void {
    // 3.2 s loop: glide in, press, ripple
    const t = frame.motion > 0.5 ? (frame.time % 3.2) / 3.2 : 0.3;
    const glide = smooth(Math.min(1, t / 0.35));
    this.pointer.position.x = -0.92 + (-1.36 + 0.92) * glide;
    this.pointer.position.y = -0.74 + (-0.5 + 0.74) * glide;
    const press = t > 0.36 && t < 0.46 ? 0.9 : 1;
    this.pointer.scale.setScalar(press);

    const r = Math.min(1, Math.max(0, (t - 0.4) / 0.4));
    this.ripple.mesh.scale.setScalar(1 + r * 1.9);
    this.ripple.state.opacity = presence > 0.98 && r > 0 && r < 1 ? (1 - r) * 0.9 : 0;
    this.ripple.mesh.visible = this.ripple.state.opacity > 0.01;
  }
}
