import { animate, style, transition, trigger, state, query, group, animateChild } from '@angular/animations';

export const overlayFade = trigger('overlayFade', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('500ms cubic-bezier(.22,1,.36,1)', style({ opacity: 1 }))
  ]),
  transition(':leave', [
    animate('500ms cubic-bezier(.22,1,.36,1)', style({ opacity: 0 }))
  ])
]);

export const sidebarSlide = trigger('sidebarSlide', [
  transition(':enter', [
    style({ transform: 'translateX(-100%)' }),
    animate('500ms cubic-bezier(.22,1,.36,1)', style({ transform: 'translateX(0)' }))
  ]),
  transition(':leave', [
    animate('500ms cubic-bezier(.22,1,.36,1)', style({ transform: 'translateX(-100%)' }))
  ])
]);

export const tabSwitch = trigger('tabSwitch', [
  transition('shop => explore', [
    group([
      query('.content', [
        style({ transform: 'translateX(0)' })
      ]),
      animate('350ms cubic-bezier(.22,1,.36,1)', style({ transform: 'translateX(-100%)' }))
    ])
  ]),
  transition('explore => shop', [
    group([
      query('.content', [
        style({ transform: 'translateX(0)' })
      ]),
      animate('350ms cubic-bezier(.22,1,.36,1)', style({ transform: 'translateX(100%)' }))
    ])
  ])
]);
