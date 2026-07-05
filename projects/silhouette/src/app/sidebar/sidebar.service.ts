import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private _isOpen = new BehaviorSubject<boolean>(false);
  isOpen$: Observable<boolean> = this._isOpen.asObservable();

  private renderer: Renderer2;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  open(): void {
    this._isOpen.next(true);
    this.renderer.addClass(document.body, 'lock-scroll');
  }

  close(): void {
    this._isOpen.next(false);
    this.renderer.removeClass(document.body, 'lock-scroll');
  }
}
