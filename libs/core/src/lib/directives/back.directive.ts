import { Location } from '@angular/common';
import { Directive, HostListener, Input } from '@angular/core';
import { Router } from '@angular/router';

@Directive({
  selector: '[fanIdBack]'
})
export class BackDirective {
  constructor(private location: Location, private router: Router) { }
  
  @Input() fanIdBack = '';
  @HostListener('click') onClick() {
    if (this.fanIdBack) {
      this.router.navigate([this.fanIdBack]);
    } else {
      this.location.back();
    }
  }
}