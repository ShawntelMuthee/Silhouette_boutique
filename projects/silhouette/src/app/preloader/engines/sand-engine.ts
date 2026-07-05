import { ANIMATION, CHAMBER_BOUNDS } from '../constants/animation.constants';

export interface SandGrain {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  opacity: number;
  settled: boolean;
  delay: number;
  sourceIndex: number;
}

export interface SandEngineOptions {
  width: number;
  height: number;
  scale: number;
  inverted: boolean;
}

export class SandEngine {
  private grains: SandGrain[] = [];
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private rafId: number | null = null;
  private running = false;
  private progress = 0;
  private options: SandEngineOptions = { width: 0, height: 0, scale: 1, inverted: false };
  private onComplete: (() => void) | null = null;
  private startTime = 0;
  private explosionMode = false;

  attach(canvas: HTMLCanvasElement, options: SandEngineOptions): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true });
    this.options = options;
    canvas.width = options.width;
    canvas.height = options.height;
  }

  detach(): void {
    this.stop();
    this.canvas = null;
    this.ctx = null;
    this.grains = [];
  }

  setInverted(inverted: boolean): void {
    this.options.inverted = inverted;
  }

  startCycle(onComplete?: () => void): void {
    this.onComplete = onComplete ?? null;
    this.progress = 0;
    this.explosionMode = false;
    this.initGrains();
    this.startTime = performance.now();
    this.running = true;
    this.tick();
  }

  explode(onComplete?: () => void): void {
    this.explosionMode = true;
    this.onComplete = onComplete ?? null;
    this.grains = [];
    const cx = this.options.width / 2;
    const cy = this.options.height / 2;

    for (let i = 0; i < ANIMATION.EXIT_EXPLOSION_PARTICLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 6;
      this.grains.push({
        x: cx + (Math.random() - 0.5) * 20,
        y: cy + (Math.random() - 0.5) * 30,
        size: 2 + Math.random(),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        opacity: 0.6 + Math.random() * 0.4,
        settled: false,
        delay: Math.random() * 80,
        sourceIndex: i,
      });
    }

    this.startTime = performance.now();
    this.running = true;
    if (this.rafId === null) {
      this.tick();
    }
  }

  stop(): void {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  clear(): void {
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  private initGrains(): void {
    const { width, height, scale, inverted } = this.options;
    const bounds = inverted ? this.flipBounds(CHAMBER_BOUNDS.lower) : CHAMBER_BOUNDS.upper;
    const targetBounds = inverted ? this.flipBounds(CHAMBER_BOUNDS.upper) : CHAMBER_BOUNDS.lower;

    this.grains = [];

    for (let i = 0; i < ANIMATION.SAND_GRAIN_COUNT; i++) {
      const t = i / ANIMATION.SAND_GRAIN_COUNT;
      const srcX = bounds.xMin + Math.random() * (bounds.xMax - bounds.xMin);
      const srcY = bounds.yMin + t * (bounds.yMax - bounds.yMin - 1) * 0.85 + Math.random() * 0.4;

      const dstX = targetBounds.xMin + Math.random() * (targetBounds.xMax - targetBounds.xMin);
      const dstY =
        targetBounds.yMax -
        (t * 0.9 + Math.random() * 0.1) * (targetBounds.yMax - targetBounds.yMin);

      this.grains.push({
        x: srcX * scale,
        y: srcY * scale,
        size:
          ANIMATION.SAND_GRAIN_SIZE_MIN +
          Math.random() * (ANIMATION.SAND_GRAIN_SIZE_MAX - ANIMATION.SAND_GRAIN_SIZE_MIN),
        vx: (Math.random() - 0.5) * 0.4 * scale,
        vy: 0,
        opacity: 1,
        settled: false,
        delay: Math.random() * 400,
        sourceIndex: i,
      });

      const grain = this.grains[this.grains.length - 1];
      (grain as SandGrain & { targetX: number; targetY: number }).targetX = dstX * scale;
      (grain as SandGrain & { targetY: number }).targetY = dstY * scale;
      (grain as SandGrain & { startX: number; startY: number }).startX = grain.x;
      (grain as SandGrain & { startY: number }).startY = grain.y;
    }

    void width;
    void height;
  }

  private flipBounds(bounds: { xMin: number; xMax: number; yMin: number; yMax: number; neckY: number }) {
    const vh = HOURGLASS_HEIGHT;
    return {
      xMin: bounds.xMin,
      xMax: bounds.xMax,
      yMin: vh - bounds.yMax,
      yMax: vh - bounds.yMin,
      neckY: vh - bounds.neckY,
    };
  }

  private tick = (): void => {
    if (!this.running || !this.ctx || !this.canvas) {
      return;
    }

    const now = performance.now();
    const elapsed = now - this.startTime;

    if (this.explosionMode) {
      this.updateExplosion(elapsed);
    } else {
      this.updateSand(elapsed);
    }

    this.render();

    if (this.running) {
      this.rafId = requestAnimationFrame(this.tick);
    } else {
      this.rafId = null;
      this.onComplete?.();
      this.onComplete = null;
    }
  };

  private updateSand(elapsed: number): void {
    const duration = ANIMATION.SAND_DURATION_MS;
    this.progress = Math.min(elapsed / duration, 1);

    if (this.progress >= 1) {
      this.running = false;
      return;
    }

    const neckX = 5.5 * this.options.scale;
    const neckY =
      (this.options.inverted ? HOURGLASS_HEIGHT - CHAMBER_BOUNDS.neck.y : CHAMBER_BOUNDS.neck.y) *
      this.options.scale;

    for (const grain of this.grains) {
      if (elapsed < grain.delay) {
        continue;
      }

      const localT = Math.min((elapsed - grain.delay) / (duration - grain.delay * 0.5), 1);
      const eased = easeInQuad(localT);

      const g = grain as SandGrain & {
        targetX: number;
        targetY: number;
        startX: number;
        startY: number;
      };

      if (localT < 0.55) {
        const fallT = localT / 0.55;
        grain.y = g.startY + (neckY - g.startY) * easeInCubic(fallT);
        grain.x = g.startX + (neckX - g.startX + grain.vx) * easeInCubic(fallT);
        grain.opacity = 1;
      } else if (localT < 0.72) {
        const throughT = (localT - 0.55) / 0.17;
        grain.x = neckX + grain.vx * 2 + (Math.random() - 0.5) * 0.3;
        grain.y = neckY + throughT * 3 * this.options.scale;
        grain.opacity = 0.85 - throughT * 0.2;
      } else {
        const settleT = (localT - 0.72) / 0.28;
        grain.x = g.startX + (g.targetX - g.startX) * easeOutQuad(settleT) + grain.vx;
        grain.y = neckY + (g.targetY - neckY) * easeOutQuad(settleT);
        grain.opacity = Math.max(0, 1 - settleT * 0.15);
        grain.settled = settleT > 0.95;
      }
    }
  }

  private updateExplosion(elapsed: number): void {
    const duration = 600;
    const t = Math.min(elapsed / duration, 1);

    for (const grain of this.grains) {
      if (elapsed < grain.delay) {
        continue;
      }

      const dt = 1;
      grain.vy += 0.12 * dt;
      grain.x += grain.vx * dt;
      grain.y += grain.vy * dt;
      grain.opacity = Math.max(0, (1 - t) * grain.opacity);
    }

    if (t >= 1) {
      this.running = false;
    }
  }

  private render(): void {
    if (!this.ctx || !this.canvas) {
      return;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = '#ffffff';

    for (const grain of this.grains) {
      if (grain.opacity <= 0.01) {
        continue;
      }
      this.ctx.globalAlpha = grain.opacity;
      this.ctx.fillRect(
        Math.round(grain.x),
        Math.round(grain.y),
        Math.ceil(grain.size),
        Math.ceil(grain.size),
      );
    }

    this.ctx.globalAlpha = 1;
  }
}

const HOURGLASS_HEIGHT = 11;

function easeInQuad(t: number): number {
  return t * t;
}

function easeInCubic(t: number): number {
  return t * t * t;
}

function easeOutQuad(t: number): number {
  return t * (2 - t);
}
