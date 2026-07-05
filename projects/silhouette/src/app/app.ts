import { Component, effect, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PreloaderComponent } from './preloader/preloader.component';
import { PreloaderService } from './preloader/preloader.service';
import { NavbarComponent } from './navbar/navbar';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PreloaderComponent, NavbarComponent, SidebarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly preloaderService = inject(PreloaderService);

  readonly contentVisible = signal(false);

  constructor() {
    this.preloaderService.initialize();

    effect(() => {
      if (this.preloaderService.phase() === 'complete') {
        this.contentVisible.set(true);
      }
    });
  }
}
