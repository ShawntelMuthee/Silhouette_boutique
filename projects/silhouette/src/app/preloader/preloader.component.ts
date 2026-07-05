import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';
import {
  ANIMATION,
  HOURGLASS_FRAME_PIXELS,
  HOURGLASS_VIEWBOX,
  HourglassPhase,
} from './constants/animation.constants';
import { GlitchDirective } from './directives/glitch.directive';
import { ParticleEngine } from './engines/particle-engine';
import { SandEngine } from './engines/sand-engine';
import { PreloaderService } from './preloader.service';

@Component({
  selector: 'app-preloader',
  standalone: true,
  imports: [GlitchDirective],
  templateUrl: './preloader.component.html',
  styleUrl: './preloader.component.scss',
  animations: [
    trigger('preloaderFade', [
      state('visible', style({ opacity: 1, visibility: 'visible' })),
      state('hidden', style({ opacity: 0, visibility: 'hidden', pointerEvents: 'none' })),
      transition('visible => hidden', animate(`${ANIMATION.EXIT_DURATION_MS}ms ease-out`)),
    ]),
    trigger('entrance', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate(`${ANIMATION.ENTRANCE_DURATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`, style({ opacity: 1 })),
      ]),
    ]),
    trigger('hourglassEntrance', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate(
          `${ANIMATION.ENTRANCE_DURATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
          keyframes([
            style({ opacity: 0, transform: 'scale(0.8)', offset: 0 }),
            style({ opacity: 1, transform: 'scale(1)', offset: 0.65 }),
            style({ opacity: 1, transform: 'scale(1)', offset: 1 }),
          ]),
        ),
      ]),
    ]),
    trigger('logoEntrance', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(12px)' }),
        animate(
          `${ANIMATION.ENTRANCE_DURATION_MS}ms 180ms cubic-bezier(0.22, 1, 0.36, 1)`,
          style({ opacity: 1, transform: 'translateY(0)' }),
        ),
      ]),
    ]),
  ],
})
export class PreloaderComponent implements AfterViewInit, OnDestroy {
  private readonly preloaderService = inject(PreloaderService);

  @ViewChild('sandCanvas') sandCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('dustCanvas') dustCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild(GlitchDirective) glitchDirective!: GlitchDirective;

  readonly framePixels = HOURGLASS_FRAME_PIXELS;
  readonly viewBox = `0 0 ${HOURGLASS_VIEWBOX.width} ${HOURGLASS_VIEWBOX.height}`;

  readonly visible = computed(() => this.preloaderService.phase() !== 'complete');
  readonly fadeState = computed(() => (this.visible() ? 'visible' : 'hidden'));

  readonly hourglassPhase = signal<HourglassPhase>('sand');
  readonly rotation = signal(0);
  readonly glowIntensity = signal(1);
  readonly isFlipping = signal(false);
  readonly inverted = signal(false);
  readonly reducedMotion = signal(false);
  readonly showContent = signal(false);
  readonly exitGlowBoost = signal(false);

  private sandEngine = new SandEngine();
  private dustEngine = new ParticleEngine();
  private cycleTimer: ReturnType<typeof setTimeout> | null = null;
  private exitInProgress = false;
  private pendingFinalFlip = false;
  private canvasScale = 8;

  constructor() {
    effect(() => {
      if (this.preloaderService.isReady() && this.preloaderService.phase() === 'active') {
        this.requestExit();
      }
    });
  }

  ngAfterViewInit(): void {
    this.reducedMotion.set(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    
    // Initialize dust immediately as it is not inside @if(showContent())
    const dustCanvas = this.dustCanvasRef.nativeElement;
    this.dustEngine.attach(dustCanvas, {
      width: window.innerWidth,
      height: window.innerHeight,
      centerX: window.innerWidth / 2,
      centerY: window.innerHeight / 2 - 20,
      spawnRadius: 80,
    });
    this.dustEngine.setEnabled(!this.reducedMotion());

    setTimeout(() => {
      this.showContent.set(true);
      this.preloaderService.setPhaseActive();

      // Trigger a quick spin and exit after a short delay
      setTimeout(() => {
        this.performFlip();
        this.requestExit();
      }, 300);

      // Wait a tick for DOM to render the sand canvas
      setTimeout(() => {
        if (this.sandCanvasRef) {
          const sandCanvas = this.sandCanvasRef.nativeElement;
          const size = this.getCanvasSize();
          this.sandEngine.attach(sandCanvas, {
            width: size,
            height: size,
            scale: this.canvasScale,
            inverted: this.inverted(),
          });
        }

        if (!this.reducedMotion()) {
          this.dustEngine.start();
          this.startCycle();
        }
      });
    }, 50);

    setTimeout(() => {
      if (this.preloaderService.isReady() && !this.exitInProgress) {
        this.requestExit();
      }
    }, ANIMATION.ENTRANCE_DURATION_MS);
  }

  ngOnDestroy(): void {
    this.clearCycleTimer();
    this.sandEngine.detach();
    this.dustEngine.detach();
  }

  private getCanvasSize(): number {
    return HOURGLASS_VIEWBOX.width * this.canvasScale + 16;
  }

  private startCycle(): void {
    if (this.reducedMotion() || this.exitInProgress) {
      return;
    }

    this.hourglassPhase.set('sand');
    this.sandEngine.setInverted(this.inverted());
    this.sandEngine.startCycle(() => this.onSandComplete());
  }

  private onSandComplete(): void {
    if (this.exitInProgress) {
      this.handleExitAfterSand();
      return;
    }

    this.hourglassPhase.set('pause');
    this.clearCycleTimer();
    this.cycleTimer = setTimeout(() => this.performFlip(), ANIMATION.PAUSE_DURATION_MS);
  }

  public performFlip(isFinal = false): void {
    if (isFinal) {
      this.pendingFinalFlip = true;
    }

    if (this.reducedMotion()) {
      this.inverted.update((v) => !v);
      if (isFinal || this.pendingFinalFlip) {
        this.pendingFinalFlip = false;
        void this.runExitSequence();
      } else {
        this.startCycle();
      }
      return;
    }

    this.hourglassPhase.set('flip');
    this.isFlipping.set(true);

    const startRotation = this.rotation();
    const targetRotation = startRotation + 180;
    const duration = ANIMATION.FLIP_DURATION_MS;
    const startTime = performance.now();

    const animateFlip = (now: number): void => {
      const t = Math.min((now - startTime) / duration, 1);
      const angle = startRotation + mechanicalFlipEasing(t) * 180;
      this.rotation.set(angle);

      if (t < 1) {
        requestAnimationFrame(animateFlip);
      } else {
        this.rotation.set(targetRotation);
        this.inverted.update((v) => !v);
        this.isFlipping.set(false);
        this.sandEngine.setInverted(this.inverted());

        if (isFinal || this.pendingFinalFlip) {
          this.pendingFinalFlip = false;
          void this.runExitSequence();
        } else {
          this.startCycle();
        }
      }
    };

    requestAnimationFrame(animateFlip);
  }

  public requestExit(): void {
    if (this.exitInProgress) {
      return;
    }
    this.exitInProgress = true;
    this.preloaderService.beginExit();
    this.dustEngine.stop();

    if (this.reducedMotion()) {
      void this.runReducedExit();
      return;
    }

    if (this.hourglassPhase() === 'sand') {
      // Wait for sand to finish, then flip
      return;
    }

    if (this.hourglassPhase() === 'pause') {
      this.performFlip(true);
      return;
    }

    if (this.hourglassPhase() === 'flip') {
      this.pendingFinalFlip = true;
    }
  }

  private handleExitAfterSand(): void {
    this.hourglassPhase.set('pause');
    this.clearCycleTimer();
    this.cycleTimer = setTimeout(() => this.performFlip(true), ANIMATION.PAUSE_DURATION_MS);
  }

  private async runExitSequence(): Promise<void> {
    this.exitGlowBoost.set(true);
    this.glowIntensity.set(2.5);

    await delay(180);

    this.sandEngine.explode();

    await delay(220);

    await this.glitchDirective?.triggerDramaticGlitch();

    await delay(120);

    this.preloaderService.complete();
  }

  private async runReducedExit(): Promise<void> {
    await delay(300);
    this.preloaderService.complete();
  }

  private clearCycleTimer(): void {
    if (this.cycleTimer !== null) {
      clearTimeout(this.cycleTimer);
      this.cycleTimer = null;
    }
  }
}

/** Mechanical flip with overshoot and tiny bounce — stepped for pixel OS feel. */
function mechanicalFlipEasing(t: number): number {
  if (t < 0.55) {
    return easeOutQuad(t / 0.55) * 1.08;
  }
  if (t < 0.72) {
    return 1.08 - easeOutQuad((t - 0.55) / 0.17) * 0.06;
  }
  if (t < 0.88) {
    return 1.02 + easeOutQuad((t - 0.72) / 0.16) * 0.03;
  }
  return 1.05 - easeOutQuad((t - 0.88) / 0.12) * 0.05;
}

function easeOutQuad(t: number): number {
  return t * (2 - t);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
