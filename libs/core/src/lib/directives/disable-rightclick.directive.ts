import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[fanIdDisableRightclick]'
})
export class DisableRightclickDirective {
  @HostListener('contextmenu', ['$event'])
  onRightClick(event) {
    event.preventDefault();
  }
}
