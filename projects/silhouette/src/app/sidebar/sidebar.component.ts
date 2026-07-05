import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarService } from './sidebar.service';
import { overlayFade, sidebarSlide, tabSwitch } from './animations';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  animations: [overlayFade, sidebarSlide, tabSwitch]
})
export class SidebarComponent {
  isOpen = false;
  activeTab: 'shop' | 'explore' = 'shop';

  constructor(private sidebarService: SidebarService) {
    this.sidebarService.isOpen$.subscribe(open => this.isOpen = open);
  }

  close(): void {
    this.sidebarService.close();
  }

  switchTab(tab: 'shop' | 'explore'): void {
    this.activeTab = tab;
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: KeyboardEvent): void {
    if (this.isOpen) {
      this.close();
    }
  }
}
