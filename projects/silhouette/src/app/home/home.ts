import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../navbar/navbar';
import { Footer } from '../footer/footer';

interface Collection {
  id: number;
  name: string;
  count: number;
  gradient: string;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule, Navbar, Footer],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  titleLetters = 'Silhouette'.split('');

  collections: Collection[] = [
    { id: 1, name: 'Sleepwear', count: 24, gradient: 'linear-gradient(135deg, #770737 0%, #9b1b4f 100%)' },
    { id: 2, name: 'Medical Scrubs', count: 18, gradient: 'linear-gradient(135deg, #8A9A5B 0%, #a7b76f 100%)' },
    { id: 3, name: 'Innerwear', count: 32, gradient: 'linear-gradient(135deg, #770737 0%, #5a0529 100%)' },
    { id: 4, name: 'Home & Bedding', count: 15, gradient: 'linear-gradient(135deg, #a7b76f 0%, #8A9A5B 100%)' },
  ];
}
