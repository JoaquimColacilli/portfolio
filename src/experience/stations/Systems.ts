import { Group } from 'three/webgpu';
import { Ink } from '../ink/Ink';
import { Sketch, TAU } from '../ink/sketch';
import { AMBER, CHASE, Dots, GREEN, ICE, SPARKLE, WHITE } from '../world/Dots';
import { Walk } from './paths';
import { Station, type Frame } from './Station';

/**
 * Sheet 3 — NTT Data, 2022.
 * A distributed system as a schematic: a hexagonal core with its ports, an API behind a
 * circuit breaker, two databases, a message queue and the delivery pipeline — with
 * requests travelling along the wires.
 *
 * Every few seconds the breaker opens: requests wait and the retry arrow starts to
 * turn. The pipeline runs stage by stage. After dark the status lights show.
 */
export class Systems extends Station {
  private packets: Dots;
  private retry = new Group();
  private spark: Dots;
  private open = 0;
  private routes: { walk: Walk; count: number; speed: number; gated: boolean }[];
  private breakerArm = new Group();
  private scratch = { x: 0, y: 0 };

  constructor() {
    super(3);
    this.addMarker('2022');
    const sk = new Sketch();
    const hx = 0.1;
    const hy = 0.05;
    const port = (k: number): [number, number] => [hx + Math.cos((k * TAU) / 6) * 0.72, hy + Math.sin((k * TAU) / 6) * 0.72];

    // ── hexagonal core ──
    sk.bold().ngon(hx, hy, 0.72, 6);
    sk.ngon(hx, hy, 0.4, 6);
    sk.thin(0.5).hatch(hx, hy, 0.36, 0.36, 0.06);
    sk.thin(0.9).together(() => {
      for (let k = 0; k < 6; k++) sk.circle(...port(k), 0.05);
    });

    // ── API, clients, retry ──
    sk.bold().rect(-1.75, 0.05, 0.7, 0.4, 0.05);
    sk.text('API', -1.75, 0.0, 0.1, 'center');
    sk.thin(0.8).pace(0.5);
    for (const y of [0.22, 0.05, -0.12]) sk.arrow(-2.42, y, -2.14, y, 0.07);
    sk.pace(1);

    // API → core, through a circuit breaker (the arm itself is animated separately)
    sk.bold().together(() => {
      sk.line(-1.4, 0.05, -1.17, 0.05);
      sk.line(-0.87, 0.05, port(3)[0] - 0.05, 0.05);
      sk.circle(-1.14, 0.05, 0.03);
      sk.circle(-0.9, 0.05, 0.03);
    });
    sk.thin(0.7).text('CB', -1.02, 0.28, 0.07, 'center');

    // ── databases ──
    const cylinder = (cx: number, cy: number, label: string) => {
      sk.bold().together(() => {
        sk.ellipse(cx, cy + 0.17, 0.28, 0.085);
        sk.line(cx - 0.28, cy + 0.17, cx - 0.28, cy - 0.17);
        sk.line(cx + 0.28, cy + 0.17, cx + 0.28, cy - 0.17);
        sk.ellipse(cx, cy - 0.17, 0.28, 0.085, Math.PI, TAU);
      });
      sk.thin(0.6).ellipse(cx, cy + 0.03, 0.28, 0.085, Math.PI, TAU);
      sk.thin(0.8).text(label, cx, cy - 0.42, 0.07, 'center');
    };
    cylinder(1.86, 0.72, 'PSQL');
    cylinder(1.86, -0.32, 'ORCL');
    const toDb1 = [...port(1), 1.2, 0.72, 1.58, 0.72];
    const toDb2 = [port(0)[0] + 0.05, hy, 1.2, hy, 1.2, -0.32, 1.58, -0.32];
    sk.bold().path(toDb1).path(toDb2);

    // ── message queue and its consumer ──
    sk.bold().rect(0.1, -1.2, 1.9, 0.26, 0.13);
    sk.thin(0.6).together(() => {
      for (let i = 0; i < 6; i++) sk.line(-0.5 + i * 0.24, -1.3, -0.5 + i * 0.24, -1.1);
    });
    sk.thin(0.8).text('MQ', -1.08, -1.24, 0.08, 'center');
    const toQueue = [port(4)[0], port(4)[1] - 0.05, port(4)[0], -1.07];
    sk.bold().path(toQueue);
    sk.rect(1.86, -1.2, 0.56, 0.32, 0.05);
    sk.text('SVC', 1.86, -1.24, 0.08, 'center');
    sk.arrow(1.05, -1.2, 1.56, -1.2, 0.07);

    // ── delivery pipeline ──
    sk.thin(0.8).text('CI/CD', -1.9, 1.34, 0.08);
    sk.bold().pace(0.6);
    for (let i = 0; i < 4; i++) {
      const x = -1.05 + i * 0.45;
      sk.circle(x, 1.38, 0.075);
      if (i < 3) sk.line(x + 0.075, 1.38, x + 0.375, 1.38);
    }
    sk.pace(1).line(0.375, 1.38, 0.72, 1.38).ngon(0.9, 1.38, 0.17, 6, Math.PI / 6);
    sk.dashed(0.6, 0.08).path([0.9, 1.2, 0.9, 1.0, port(2)[0], 1.0, port(2)[0], port(2)[1] + 0.06]);
    this.addInk(sk);

    // circuit breaker arm
    const arm = new Sketch();
    arm.bold().line(0, 0, 0.24, 0);
    const armInk = new Ink(arm, { boil: 0 });
    this.inks.push(armInk);
    this.breakerArm.add(armInk.mesh);
    this.breakerArm.position.set(-1.14, 0.05, 0);
    this.group.add(this.breakerArm);

    // retry arrow: turns while the breaker is open
    const retry = new Sketch();
    retry.thin(0.8).together(() => {
      retry.circle(0, 0, 0.15, -0.5, 4.1);
      retry.path([0.09, -0.16, 0.132, -0.128, 0.082, -0.08]);
    });
    this.addInk(retry, { boil: 0.0015 }, this.retry);
    this.retry.position.set(-1.75, 0.58, 0);
    this.group.add(this.retry);

    // the pipeline runs: a pulse from stage to stage, white by day and green after dark
    for (const [gate, tone] of [
      [-1, WHITE],
      [1, GREEN],
    ] as const) {
      const stages = this.addLamps(5, { mode: CHASE, speed: 2.2, gate });
      for (let i = 0; i < 4; i++) stages.set(i, -1.05 + i * 0.45, 1.38, 0.03, 0.17, i / 5, tone, 1);
      stages.set(4, 0.9, 1.38, 0.03, 0.24, 4 / 5, tone, 1).commit(true);
    }
    // status lights, seen only at night
    const status = this.addLamps(9, { mode: SPARKLE, gate: 1 });
    let n = 0;
    for (const cy of [0.72, -0.32]) {
      for (let i = 0; i < 3; i++) status.set(n++, 1.74 + i * 0.12, cy - 0.06, 0.03, 0.1, 0.13 + n * 0.19, i === 2 ? AMBER : GREEN, 1);
    }
    status.set(n++, -1.47, 0.19, 0.03, 0.1, 0.4, GREEN, 1);
    status.set(n++, 2.06, -1.1, 0.03, 0.1, 0.7, GREEN, 1);
    status.set(n++, -0.62, -1.2, 0.03, 0.1, 0.9, AMBER, 1).commit(true);
    const core = this.addLamps(1, { gate: 1, soft: 1 });
    core.set(0, hx, hy, -0.05, 3.0, 0.3, ICE, 0.22).commit(true);
    // a spark where the breaker opens
    this.spark = this.addLamps(2, {}, this.group, false);
    this.spark.set(0, -1.02, 0.1, 0.03, 0.34, 0, AMBER, 0.8).set(1, -1.02, 0.1, 0.03, 0.12, 0, AMBER, 1).commit(true);
    this.addBeacon();

    // requests on the wires
    this.routes = [
      { walk: new Walk([-1.4, 0.05, port(3)[0], 0.05]), count: 3, speed: 0.34, gated: true },
      { walk: new Walk(toDb1), count: 3, speed: 0.22, gated: false },
      { walk: new Walk(toDb2), count: 3, speed: 0.2, gated: false },
      { walk: new Walk([port(4)[0], port(4)[1], port(4)[0], -1.2, 1.56, -1.2]), count: 5, speed: 0.13, gated: false },
      { walk: new Walk([-0.975, 1.38, 0.72, 1.38]), count: 2, speed: 0.16, gated: false },
    ];
    const total = this.routes.reduce((n, r) => n + r.count, 0);
    this.packets = new Dots(total, { opacity: 0 });
    for (let i = 0; i < total; i++) this.packets.set(i, 0, 0, 0.04, 0.11, 0, 0, 1);
    this.packets.commit(true);
    this.group.add(this.packets.mesh);
  }

  protected animate(frame: Frame, presence: number): void {
    const t = frame.motion > 0.5 ? frame.time : 2;
    // the breaker opens for a moment every few seconds; requests on that wire wait
    const cycle = t % 7;
    const open = cycle > 5 && cycle < 6.5;
    const target = open ? 0.55 : 0;
    this.breakerArm.rotation.z += (target - this.breakerArm.rotation.z) * Math.min(1, frame.delta * 10 + (frame.motion > 0.5 ? 0 : 1));
    // while it is open the retry arrow turns, and there is a spark at the contact as it opens
    this.open += ((open ? 1 : 0) - this.open) * Math.min(1, frame.delta * 6);
    this.retry.rotation.z -= frame.delta * 7 * this.open * frame.motion;
    const flash = frame.motion > 0.5 && cycle > 5 && cycle < 5.35 ? 1 - (cycle - 5) / 0.35 : 0;
    this.spark.state.opacity = presence > 0.97 ? flash : 0;
    this.spark.mesh.visible = this.spark.state.opacity > 0.01;

    let i = 0;
    for (const route of this.routes) {
      for (let k = 0; k < route.count; k++, i++) {
        const u = (t * route.speed + k / route.count) % 1;
        const p = route.walk.at(u, this.scratch);
        const blocked = route.gated && open && u > 0.3;
        this.packets.move(i, p.x, p.y, 0.04).alpha(i, blocked ? 0 : Math.min(1, Math.min(u, 1 - u) * 12));
      }
    }
    this.packets.commit(true);
    this.packets.state.opacity = presence > 0.97 ? 1 : 0;
    this.packets.mesh.visible = this.packets.state.opacity > 0;
  }

  dispose(): void {
    super.dispose();
    this.packets.dispose();
  }
}
