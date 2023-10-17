import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'fan-id-package-upload-submission-status',
  templateUrl: './package-upload-submission-status.component.html',
  styleUrls: ['./package-upload-submission-status.component.scss']
})
export class PackageUploadSubmissionStatusComponent {
  @Output() closeThis = new EventEmitter();
  @Input() status: { totalSuccess: number; totalFailed: number } = { totalSuccess: 0, totalFailed: 0 };
}
