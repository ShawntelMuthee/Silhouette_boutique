import {
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
  inject,
} from '@angular/core';
import { ANIMATION } from '../constants/animation.constants';

type GlitchType = 'substitute' | 'underscore' | 'shift-up' | 'shift-x';

const GLITCH_CHARS = '0123456789_#@$%&*';

@Directive({
  selector: '[appGlitch]',
  standalone: true,
})
export class GlitchDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);

  @Input() appGlitchEnabled = true;
  @Input() appGlitchDramatic = false;

  private originalText = 'SILHOUETTE';
  private intervalId: ReturnType<typeof setTimeout> | null = null;
  private reducedMotion = false;

  ngOnInit(): void {
    this.originalText = this.el.nativeElement.textContent?.trim() || 'SILHOUETTE';
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!this.appGlitchEnabled || this.reducedMotion) {
      return;
    }

    this.scheduleNextGlitch();
  }

  ngOnDestroy(): void {
    this.clearSchedule();
  }

  triggerDramaticGlitch(): Promise<void> {
    if (this.reducedMotion) {
      return Promise.resolve();
    }

    return this.runGlitch(true);
  }

  private scheduleNextGlitch(): void {
    if (!this.appGlitchEnabled || this.reducedMotion) {
      return;
    }

    const delay =
      ANIMATION.GLITCH_MIN_INTERVAL_MS +
      Math.random() * (ANIMATION.GLITCH_MAX_INTERVAL_MS - ANIMATION.GLITCH_MIN_INTERVAL_MS);

    this.intervalId = setTimeout(() => {
      void this.runGlitch(false).then(() => this.scheduleNextGlitch());
    }, delay);
  }

  private clearSchedule(): void {
    if (this.intervalId !== null) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
  }

  private runGlitch(dramatic: boolean): Promise<void> {
    const duration =
      ANIMATION.GLITCH_DURATION_MIN_MS +
      Math.random() * (ANIMATION.GLITCH_DURATION_MAX_MS - ANIMATION.GLITCH_DURATION_MIN_MS);

    const type = this.pickGlitchType(dramatic);
    const { text, style } = this.applyGlitch(type, dramatic);

    this.renderer.setProperty(this.el.nativeElement, 'textContent', text);

    if (style.transform) {
      this.renderer.setStyle(this.el.nativeElement, 'transform', style.transform);
    }
    if (style.letterSpacing) {
      this.renderer.setStyle(this.el.nativeElement, 'letter-spacing', style.letterSpacing);
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        this.renderer.setProperty(this.el.nativeElement, 'textContent', this.originalText);
        this.renderer.removeStyle(this.el.nativeElement, 'transform');
        this.renderer.setStyle(this.el.nativeElement, 'letter-spacing', '12px');
        resolve();
      }, dramatic ? duration * 2 : duration);
    });
  }

  private pickGlitchType(dramatic: boolean): GlitchType {
    const types: GlitchType[] = dramatic
      ? ['substitute', 'underscore', 'shift-up', 'shift-x']
      : ['substitute', 'underscore', 'shift-up', 'shift-x'];
    return types[Math.floor(Math.random() * types.length)];
  }

  private applyGlitch(
    type: GlitchType,
    dramatic: boolean,
  ): { text: string; style: { transform?: string; letterSpacing?: string } } {
    const chars = this.originalText.split('');
    const idx = Math.floor(Math.random() * chars.length);
    const style: { transform?: string; letterSpacing?: string } = {};

    switch (type) {
      case 'substitute': {
        const count = dramatic ? 2 : 1;
        for (let i = 0; i < count; i++) {
          const j = (idx + i) % chars.length;
          if (chars[j] !== ' ') {
            chars[j] = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
          }
        }
        break;
      }
      case 'underscore': {
        const j = idx % chars.length;
        if (chars[j] !== ' ') {
          chars[j] = '_';
        }
        break;
      }
      case 'shift-up':
        style.transform = 'translateY(-1px)';
        break;
      case 'shift-x':
        style.transform = `translateX(${Math.random() > 0.5 ? 1 : -1}px)`;
        break;
    }

    return { text: chars.join(''), style };
  }
}
