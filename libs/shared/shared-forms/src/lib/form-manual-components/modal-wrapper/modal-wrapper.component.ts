import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'fan-id-modal-wrapper',
  template: `
    <div class="modalpane-wrapper" [ngStyle]="customStyleObj">
      <div class="modalpane-body">
        <div class="modalpane-header">
          <h4
            class="font-24 text-center"
          >
            {{ title }}
          </h4>
          <div class="modalpane-closebtn">
            <img
              src="/assets/icons/close 001.svg"
              style="width: 32px"
              alt="close icon"
              (click)="closeThis.emit('close')"
            />
          </div>
        </div>
        <ng-content></ng-content>
      </div>
    </div>
    <div class="modalpane-backdrop"></div>
  `,
  styleUrls: ['./modal-wrapper.component.scss'],
})
export class ModalWrapperComponent implements OnInit {
  @Input() title: string;
  @Input() customStyle = false;
  @Input() config: { [key: string]: string } = {};
  @Output() closeThis = new EventEmitter();

  customStyleObj: { [key: string]: string } = {};

  ngOnInit() {
      if (this.customStyle) {
        this.customStyleObj.width = '50%';
      }

      Object.keys(this.config).forEach(key => {
        this.customStyleObj[key] = this.config[key];
      })
  }
}
