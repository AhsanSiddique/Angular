import { Component, Input } from '@angular/core';

@Component({
  selector: 'fan-id-back-arrow',
  template: `
    <button class="btn btn-sm back pl-0">
      <a href="javascript:void(0)" class="back-ico" [fanIdBack]="backUrl" title="Back">
        <svg width="29" height="24" viewBox="0 0 29 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m11.356.496 2.259 2.25-7.54 7.615H29v3.206H6.075l7.54 7.615-2.26 2.25L0 11.964 11.356.496Z" fill="#8A1538"/></svg>
        <span class="sr-only">Back</span>
      </a>
    </button>
  `,
  styles: []
})
export class BackArrowComponent {
  @Input() backUrl = '';
}
