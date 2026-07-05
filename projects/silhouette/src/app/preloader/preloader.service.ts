import { Injectable, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, take } from 'rxjs/operators';
import { PreloaderPhase } from './constants/animation.constants';

export interface PreloaderReadyState {
  appInitialized: boolean;
  assetsLoaded: boolean;
  routeRendered: boolean;
}

@Injectable({ providedIn: 'root' })
export class PreloaderService {
  private readonly router = inject(Router);

  private readonly _appInitialized = signal(false);
  private readonly _assetsLoaded = signal(false);
  private readonly _routeRendered = signal(false);
  private readonly _phase = signal<PreloaderPhase>('hidden');
  private readonly _exitRequested = signal(false);

  readonly phase = this._phase.asReadonly();
  readonly exitRequested = this._exitRequested.asReadonly();

  readonly isReady = computed(
    () =>
      this._appInitialized() &&
      this._assetsLoaded() &&
      this._routeRendered(),
  );

  readonly readyState = computed<PreloaderReadyState>(() => ({
    appInitialized: this._appInitialized(),
    assetsLoaded: this._assetsLoaded(),
    routeRendered: this._routeRendered(),
  }));

  initialize(): void {
    this._phase.set('entering');

    // Immediately consider fonts and images ready (skip heavy loading checks)
    this._assetsLoaded.set(true);

    this.watchRouteRender();

    // Force complete after 2 seconds regardless of readiness
    setTimeout(() => this.complete(), 2000);

    queueMicrotask(() => {
      this._appInitialized.set(true);
    });
  }

  beginExit(): void {
    if (this._exitRequested() || this._phase() === 'complete') {
      return;
    }
    this._exitRequested.set(true);
    this._phase.set('exiting');
  }

  complete(): void {
    this._phase.set('complete');
  }

  setPhaseActive(): void {
    if (this._phase() === 'entering') {
      this._phase.set('active');
    }
  }

  markRouteRendered(): void {
    this._routeRendered.set(true);
  }

  private watchRouteRender(): void {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        take(1),
      )
      .subscribe(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            this.markRouteRendered();
          });
        });
      });
  }

  private waitForFonts(): void {
    if (typeof document === 'undefined' || !('fonts' in document)) {
      this._assetsLoaded.set(true);
      return;
    }

    document.fonts.ready
      .then(() => {
        this._assetsLoaded.set(true);
      })
      .catch(() => {
        this._assetsLoaded.set(true);
      });

    setTimeout(() => {
      if (!this._assetsLoaded()) {
        this._assetsLoaded.set(true);
      }
    }, 1000);
  }

  private waitForImages(): void {
    if (typeof document === 'undefined') {
      return;
    }

    const images = Array.from(document.images);
    if (images.length === 0) {
      return;
    }

    let pending = images.filter((img) => !img.complete).length;
    if (pending === 0) {
      return;
    }

    const onDone = (): void => {
      pending -= 1;
      if (pending <= 0 && !this._assetsLoaded()) {
        // Fonts gate remains primary; images are best-effort.
      }
    };

    images.forEach((img) => {
      if (!img.complete) {
        img.addEventListener('load', onDone, { once: true });
        img.addEventListener('error', onDone, { once: true });
      }
    });
  }
}
