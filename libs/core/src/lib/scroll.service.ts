import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {

  constructor(
    @Inject(DOCUMENT) private document: Document,
  ) {}

  scrollToTop() {
    // div with id top-of-page is expected as the first element inside app body.
    const topOfPageElement = this.document.querySelector('#top-of-page');
    topOfPageElement.scrollIntoView();
  }
}
