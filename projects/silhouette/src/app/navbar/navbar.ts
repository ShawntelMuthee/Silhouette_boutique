import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarService } from '../sidebar/sidebar.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent {
  isScrolled = signal(false);
  constructor(private sidebar: SidebarService) {}

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;
    
    if (scrollPosition > 80 && !this.isScrolled()) {
      this.isScrolled.set(true);
    } else if (scrollPosition <= 20 && this.isScrolled()) {
      this.isScrolled.set(false);
    }
  }

  /** Called from the three‑line menu button */
  openSidebar() {
    this.sidebar.open();
  }
}
