import { clamp, lerp } from './math';

/**
 * The stage turns the scroll position into a "sheet coordinate": 3 means sheet 3 is
 * centred, 3.5 means the camera is halfway to sheet 4. Both the DOM and the 3D world
 * read it, so they can never drift apart.
 *
 * While a sheet is pinned the coordinate still creeps from n − HOLD to n + HOLD, which
 * keeps the scene moving a little for as long as the visitor scrolls.
 */
const HOLD = 0.06;

type Listener = (index: number) => void;

class Stage {
  /** continuous sheet coordinate */
  s = 0;
  /** index of the sheet currently in front of the visitor */
  index = 0;
  /** 0…1 over the whole document */
  progress = 0;
  /** scroll speed in viewport heights per second, signed */
  velocity = 0;
  count = 0;

  private sections: HTMLElement[] = [];
  private keys: { y: number; s: number }[] = [];
  private listeners = new Set<Listener>();
  private scroller: ((y: number, immediate: boolean) => void) | null = null;
  private max = 1;
  private lastY = 0;

  /** Registers the sheets, in document order. */
  setSections(sections: HTMLElement[]): void {
    this.sections = sections;
    this.count = sections.length;
    this.measure();
  }

  /** Lets the smooth-scroll layer take over programmatic scrolling. */
  setScroller(fn: ((y: number, immediate: boolean) => void) | null): void {
    this.scroller = fn;
  }

  measure(): void {
    const vh = window.innerHeight;
    this.max = Math.max(1, document.documentElement.scrollHeight - vh);
    this.keys = [];
    this.sections.forEach((el, i) => {
      const top = el.offsetTop;
      const height = el.offsetHeight;
      if (height <= vh + 1) {
        // shorter than the viewport: a single key when it is centred
        this.keys.push({ y: clamp(top + (height - vh) / 2, 0, this.max), s: i });
      } else {
        this.keys.push({ y: clamp(top, 0, this.max), s: i - HOLD });
        this.keys.push({ y: clamp(top + height - vh, 0, this.max), s: i + HOLD });
      }
    });
    this.update(window.scrollY, 0);
  }

  update(y: number, dt: number): void {
    const vh = window.innerHeight || 1;
    if (dt > 0) {
      const v = (y - this.lastY) / vh / dt;
      this.velocity = lerp(this.velocity, v, 1 - Math.exp(-12 * dt));
    }
    this.lastY = y;
    this.progress = clamp(y / this.max);

    const k = this.keys;
    if (k.length === 0) return;
    let s = k[0].s;
    if (y >= k[k.length - 1].y) s = k[k.length - 1].s;
    else if (y > k[0].y) {
      for (let i = 0; i < k.length - 1; i++) {
        if (y <= k[i + 1].y) {
          const span = k[i + 1].y - k[i].y;
          s = span > 0 ? lerp(k[i].s, k[i + 1].s, (y - k[i].y) / span) : k[i + 1].s;
          break;
        }
      }
    }
    this.s = s;
    const index = clamp(Math.round(s), 0, Math.max(0, this.count - 1));
    if (index !== this.index) {
      this.index = index;
      this.listeners.forEach((fn) => fn(index));
    }
  }

  /** 1 when sheet `i` is centred, falling to 0 as the camera leaves it. */
  presence(i: number, reach = 1): number {
    return clamp(1 - Math.abs(this.s - i) / reach);
  }

  /** Scroll position at which sheet `i` is in front of the visitor. */
  positionOf(i: number): number {
    const el = this.sections[clamp(Math.round(i), 0, this.count - 1)];
    if (!el) return 0;
    const extra = el.offsetHeight - window.innerHeight;
    // Shorter than the viewport: centre it. Taller: its top, unless its styles ask for
    // another point of its scroll range through --jump (0…1).
    const along = extra <= 1 ? 0.5 : clamp(Number.parseFloat(getComputedStyle(el).getPropertyValue('--jump')) || 0);
    return clamp(el.offsetTop + extra * along, 0, this.max);
  }

  /** Jumps (or glides) to a sheet. */
  jump(i: number, immediate = false): void {
    const y = this.positionOf(i);
    if (this.scroller) this.scroller(y, immediate);
    else window.scrollTo({ top: y, behavior: immediate ? 'instant' : 'smooth' });
  }

  /** Scroll position for an exact sheet coordinate (inverse of update). */
  scrollFor(s: number): number {
    const k = this.keys;
    if (k.length === 0) return 0;
    if (s <= k[0].s) return k[0].y;
    for (let i = 0; i < k.length - 1; i++) {
      if (s <= k[i + 1].s) {
        const span = k[i + 1].s - k[i].s;
        return span > 0 ? lerp(k[i].y, k[i + 1].y, (s - k[i].s) / span) : k[i].y;
      }
    }
    return k[k.length - 1].y;
  }

  onIndex(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
}

export const stage = new Stage();
