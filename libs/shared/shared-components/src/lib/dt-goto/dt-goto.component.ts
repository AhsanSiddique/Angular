import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'fan-id-dt-goto',
  template: `
    <div class="dt-goto">
      <div class="dt-goto-text">Go To</div>
      <div class="dt-goto-input">
        <input mask="0*"
          style="width: 100%; height: 100% !important; padding: 0.35rem !important;"
          class="form-control" type="text" [(ngModel)]="pagenumber"
        >
      </div>
      <button class="dt-goto-btn btn btn-primary btn-caret-8" style="min-width: 0px;"
      (click)="go()" [disabled]="!(+pagenumber)">{{'Common.Go' | translate}}</button>
    </div>
  `,
  styles: [
    `
    .dt-goto {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
      align-items: center;
      height: 24px;
      font-size: 0.8rem;
    }

    .dt-goto-input {
      width: 60px;
      height: 28px;
    }

    .dt-goto-btn {
      background-color: #081c3b;
      color: #fff;
      transform: scale(0.8);
      border-radius: 0px;

    }

    `
  ]
})
export class DtGotoComponent  {
  @Output() _go = new EventEmitter<number>();
  pagenumber: string;

  go() {
    if(!(+this.pagenumber)) return;
    this._go.emit(+this.pagenumber);
  }
}
