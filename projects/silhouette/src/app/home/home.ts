import { Component, OnInit, OnDestroy, signal, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../footer/footer.component';

interface CategoryItem {
  num: string;
  name: string;
  slug: string;
  image: string;
  sentence: string;
}

interface ProductItem {
  name: string;
  price: string;
  primaryImg: string;
  secondaryImg?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FooterComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('heroVideo') heroVideo!: ElementRef<HTMLVideoElement>;

  categories: CategoryItem[] = [
    { num: '01', name: 'Sleepwear', slug: 'sleepwear', image: 'assets/hero-images/Pajamas.webp', sentence: 'Soft essentials for slower mornings and quieter evenings.' },
    { num: '02', name: 'Gymwear', slug: 'gymwear', image: 'assets/hero-images/gymwear.webp', sentence: 'Performance and comfort that move with you.' },
    { num: '03', name: 'Innerwear', slug: 'innerwear', image: 'assets/hero-images/innerwear.webp', sentence: 'Everyday confidence, from the inside out.' },
    { num: '04', name: 'Maternity Wear', slug: 'maternity', image: 'assets/hero-images/maternity.webp', sentence: 'Comfort and support for every stage of motherhood.' },
    { num: '05', name: 'Medical Scrubs', slug: 'scrubs', image: 'assets/hero-images/Scrubs.webp', sentence: 'Functional, comfortable and made for every shift.' },
    { num: '06', name: 'Bedspread & Duvets', slug: 'bedspread', image: 'assets/hero-images/duvets.webp', sentence: 'Timeless comfort for your favourite space.' }
  ];

  activeCategory = signal<CategoryItem>(this.categories[0]);

  newArrivals: ProductItem[] = [
    {
      name: 'Classic Satin Pajama Set',
      price: '4,250',
      primaryImg: 'assets/hero-images/Pajamas.webp',
      secondaryImg: 'assets/products/scrub_top_secondary.png'
    },
    {
      name: 'Ribbed Lounge Set',
      price: '3,850',
      primaryImg: 'assets/products/lounge_trouser_primary.png',
      secondaryImg: 'assets/products/lounge_trouser_secondary.png'
    },
    {
      name: 'Sculpt Seamless Leggings',
      price: '3,250',
      primaryImg: 'assets/hero-images/gymwear.webp',
      secondaryImg: 'assets/products/ribbed_bralette_secondary.png'
    },
    {
      name: 'Silk Slip Dress',
      price: '2,950',
      primaryImg: 'assets/hero-images/innerwear.webp',
      secondaryImg: 'assets/products/linen_duvet_secondary.png'
    }
  ];

  private observer: IntersectionObserver | null = null;

  constructor(private el: ElementRef) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.setupScrollReveal();
    this.playHeroVideo();
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private playHeroVideo() {
    if (this.heroVideo?.nativeElement) {
      const video = this.heroVideo.nativeElement;
      video.muted = true;
      video.playsInline = true;
      video.play().catch(err => {
        console.warn('Hero video play prevented:', err);
      });
    }
  }

  onHoverCategory(cat: CategoryItem) {
    this.activeCategory.set(cat);
  }

  onSelectCategory(slug: string) {
    console.log(`Navigating to category: ${slug}`);
  }

  onSelectProduct(productName: string) {
    console.log(`Opening product: ${productName}`);
  }

  onShopNow() {
    const section = document.getElementById('new-arrivals');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }

  onDiscoverCampaign() {
    console.log('Discover Campaign clicked');
  }

  onViewAll() {
    console.log('View All clicked');
  }

  private setupScrollReveal() {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const targets = this.el.nativeElement.querySelectorAll('.reveal-on-scroll');
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            if (this.observer) {
              this.observer.unobserve(entry.target);
            }
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
      });

      targets.forEach((target: Element) => {
        this.observer!.observe(target);
      });
    } else {
      const targets = this.el.nativeElement.querySelectorAll('.reveal-on-scroll');
      targets.forEach((target: Element) => {
        target.classList.add('in-view');
      });
    }
  }
}
