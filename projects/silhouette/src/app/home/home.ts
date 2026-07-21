import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface HeroImage {
  src: string;
  alt: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, OnDestroy {
  // Hero images configuration - easily extensible
  images: HeroImage[] = [
    { src: 'assets/hero-images/Pajamas.webp', alt: 'Walking through flowers in elegant sleepwear' },
    { src: 'assets/hero-images/gymwear.webp', alt: 'Relaxed confidence: person in premium gymwear' },
    { src: 'assets/hero-images/innerwear.webp', alt: 'Cozy luxury bedroom moment in fine innerwear' },
    { src: 'assets/hero-images/duvets.webp', alt: 'Cozy luxury bedroom with duvets' },
    { src: 'assets/hero-images/maternity.webp', alt: 'Sunlight filled morning in maternity wear' },
    //
  ];

  newArrivals = [
    {
      name: 'Classic Scrub Top',
      price: '$85',
      primaryImg: 'assets/products/scrub_top_primary.png',
      secondaryImg: 'assets/products/scrub_top_secondary.png'
    },
    {
      name: 'Silk Lounge Trouser',
      price: '$140',
      primaryImg: 'assets/products/lounge_trouser_primary.png',
      secondaryImg: 'assets/products/lounge_trouser_secondary.png'
    },
    {
      name: 'Ribbed Bralette',
      price: '$65',
      primaryImg: 'assets/products/ribbed_bralette_primary.png',
      secondaryImg: 'assets/products/ribbed_bralette_secondary.png'
    },
    {
      name: 'Linen Duvet Set',
      price: '$210',
      primaryImg: 'assets/products/linen_duvet_primary.webp',
      secondaryImg: 'assets/products/linen_duvet_secondary.webp'
    }
  ];

  activeImageIndex = signal(0);
  private rotationInterval: any;
  private isReducedMotion = false;

  ngOnInit() {
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.preloadImages();
    this.startImageRotation();
  }

  ngOnDestroy() {
    if (this.rotationInterval) {
      clearInterval(this.rotationInterval);
    }
  }

  onShopNow() {
    // Navigate to products page or handle CTA click
    console.log('Shop Now clicked');
  }

  onViewAllArrivals() {
    console.log('View All Arrivals clicked');
  }

  onSelectProduct(productName: string) {
    console.log(`Product selected: ${productName}`);
  }

  private preloadImages() {
    // Preload future images for perfect performance and smooth transitions
    this.images.slice(1).forEach(img => {
      const image = new Image();
      image.src = img.src;
    });
  }

  private startImageRotation() {
    // Smooth image change every 8 seconds
    this.rotationInterval = setInterval(() => {
      this.activeImageIndex.update(idx => (idx + 1) % this.images.length);
    }, 8000);
  }
}
