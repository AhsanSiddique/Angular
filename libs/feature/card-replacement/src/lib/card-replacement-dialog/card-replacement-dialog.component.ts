import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'fan-id-card-replacement-dialog',
  templateUrl: './card-replacement-dialog.component.html',
  styleUrls: ['./card-replacement-dialog.component.scss'],
})
export class CardReplacementDialogComponent implements OnInit {
  @Input() id?: number = 0;
  @Output() closeThis = new EventEmitter();
  cardReplacementForm: FormGroup;
  REASONS = [
    { reasonId: 2, label: 'Lost/Stolen' },
    { reasonId: 3, label: 'Card Malfunctioning' },
    // { reasonId: 6, label: 'Update Info' },
  ];
  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.cardReplacementForm = this.fb.group({
      reason: ['', Validators.required],
      selectedReason: [null, Validators.required],
    });
    this.cardReplacementForm.controls.selectedReason.patchValue('Lost/Stolen');
  }
  onSelect() {
    console.log(
      'application value> ',
      this.cardReplacementForm.value.selectedReason
    );
    if (
      this.cardReplacementForm.controls.selectedReason.value ===
      'Update Info'
    ) {
      this.cardReplacementForm.get('reason').setValidators(null);
      this.cardReplacementForm.controls.reason.setValue(null);
    } else {
      this.cardReplacementForm
        .get('reason')
        .setValidators([Validators.required]);
    }
  }
  reasonField() {
    let result = true;
    if (
      this.cardReplacementForm.controls.selectedReason.value ===
      'Update Info'
    ) {
      result = false;
    }
    return result;
  }
  submit() {
    const submitData = {
      ApplicationId: this.id,
      Reason: this.cardReplacementForm.controls.selectedReason.value,
      description: this.cardReplacementForm.controls.reason.value,
      reasonType: this.REASONS[
        this.REASONS.findIndex(
          (item) =>
            item.label ===
            this.cardReplacementForm.controls.selectedReason.value
        )
      ].reasonId,
    };
    this.closeThis.emit(submitData);
  }
  reasonPadding(reason) {
    switch (reason) {
      case 'Lost/Stolen':
        return 'lost-stolen-replacement-dialog';
      case 'Card Malfunctioning':
        return 'card-malfunctioning-replacement-dialog';
      case 'Update Info':
        return 'incorrect-info-replacement-dialog';
    }
  }
}
