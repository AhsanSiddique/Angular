import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'fan-id-update-status-modal',
  templateUrl: './update-status-modal.component.html',
  styleUrls: ['./update-status-modal.component.scss']
})
export class UpdateStatusModalComponent implements OnInit {
  @Input() fanid: string = '';
  @Input() cardStatus:number = 0;
  @Output() closeThis = new EventEmitter();
  cardStatusChangeForm: FormGroup;
  STATS = [
    { statsId: 4, label: 'Ready For Collection' },
    { statsId: 5, label: 'Collected By Fan' },
    { statsId: 10, label: 'Home Delivery' },
    { statsId: 11, label: 'Ready for Collection (QPR) ' },
    // { reasonId: 6, label: 'Update Info' },
  ];
  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    console.log(this.cardStatus, typeof this.cardStatus)
    this.cardStatusChangeForm = this.fb.group({
      selectedStatus: [null, Validators.required],
      // selectedStatus1: [null, Validators.required],
    });
    if(this.cardStatus == 5){
      // this.cardStatusChangeForm.controls.selectedStatus.disabled
    }
  }
  onSelect() {
    // This is intentional
  }

  submit() {
    let cardStatusUpdateRequest = []
    const submitData = {
      fanID:this.fanid,
      status: parseInt(this.cardStatusChangeForm.controls.selectedStatus.value),
      updatePreviousStatus:true,
      forceUpdate:true,
      StatusDescription:this.STATS[
        this.STATS.findIndex(
          (item) =>
            item.statsId ===
            parseInt(this.cardStatusChangeForm.controls.selectedStatus.value)
        )
      ].label
    };
    cardStatusUpdateRequest.push(submitData)
    this.closeThis.emit(cardStatusUpdateRequest);
  }
}
