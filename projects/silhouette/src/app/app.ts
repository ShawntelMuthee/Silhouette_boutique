import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppLoader } from './app-loader/app-loader';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppLoader],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly title = signal('silhouette');
  protected isLoading = signal(true);

  ngOnInit(): void {
    // Show loader for 3 seconds
    setTimeout(() => {
      this.isLoading.set(false);
    }, 3000);
  }
}
