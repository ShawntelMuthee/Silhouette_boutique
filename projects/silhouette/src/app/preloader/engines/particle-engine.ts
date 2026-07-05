import { ANIMATION } from '../constants/animation.constants';

export interface DustParticle {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  opacity: number;
  life: number;
  maxLife: number;
}

export interface ParticleEngineOptions {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  spawnRadius: number;
}

export class ParticleEngine {
  private particles: DustParticle[] = [];
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private rafId: number | null = null;
  private running = false;
  private options: ParticleEngineOptions = {
    width: 0,
    height: 0,
    centerX: 0,
    centerY: 0,
    spawnRadius: 60,
  };
  private lastSpawn = 0;
  private enabled = true;

  attach(canvas: HTMLCanvasElement, options: ParticleEngineOptions): void {
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
    this.particles = [];
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.particles = [];
    }
  }

  start(): void {
    if (this.running) {
      return;
    }
    this.running = true;
    this.lastSpawn = performance.now();
    this.tick();
  }

  stop(): void {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  clear(): void {
    this.particles = [];
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  private spawnBatch(now: number): void {
    if (!this.enabled) {
      return;
    }

    if (now - this.lastSpawn < ANIMATION.DUST_SPAWN_INTERVAL_MS) {
      return;
    }

    this.lastSpawn = now;
    const count =
      ANIMATION.DUST_SPAWN_COUNT_MIN +
      Math.floor(
        Math.random() * (ANIMATION.DUST_SPAWN_COUNT_MAX - ANIMATION.DUST_SPAWN_COUNT_MIN + 1),
      );

    const { centerX, centerY, spawnRadius } = this.options;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = spawnRadius * (0.6 + Math.random() * 0.5);
      const maxLife = 1200 + Math.random() * 1800;

      this.particles.push({
        x: centerX + Math.cos(angle) * dist,
        y: centerY + Math.sin(angle) * dist,
        size: 1 + Math.random(),
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.1 - Math.random() * 0.25,
        opacity: 0.08 + Math.random() * 0.12,
        life: 0,
        maxLife,
      });
    }
  }

  private tick = (): void => {
    if (!this.running || !this.ctx || !this.canvas) {
      return;
    }

    const now = performance.now();
    this.spawnBatch(now);
    this.update();
    this.render();

    this.rafId = requestAnimationFrame(this.tick);
  };

  private update(): void {
    this.particles = this.particles.filter((p) => {
      p.life += 16;
      p.x += p.vx;
      p.y += p.vy;
      p.vx += (Math.random() - 0.5) * 0.02;
      const lifeRatio = p.life / p.maxLife;
      p.opacity = Math.max(0, p.opacity * (1 - lifeRatio * 0.015));
      return p.life < p.maxLife && p.opacity > 0.01;
    });
  }

  private render(): void {
    if (!this.ctx || !this.canvas) {
      return;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const p of this.particles) {
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    }

    this.ctx.globalAlpha = 1;
  }
}
