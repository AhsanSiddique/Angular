import { Component, EventEmitter, Input, Output } from '@angular/core';
import { VoucherService } from '@fan-id/api/server';

@Component({
  selector: 'fan-id-voucher-excel-upload-status',
  templateUrl: './voucher-excel-upload-status.component.html',
  styleUrls: ['./voucher-excel-upload-status.component.scss']
})
export class VoucherExcelUploadStatusComponent {
  @Output() closeThis = new EventEmitter();
  @Input() status: any;
  constructor(
    private voucherService: VoucherService
  ) { }

  exportFailedRecords() {
    const { bulkGroupExtractId, refEvent_Code } = this.status ?? {};
    const body = { bulkGroupExtractId, refEvent_Code };
    this.voucherService.exportFailedApplications(body).subscribe({
      next: res => {
        const url = window.URL.createObjectURL(res);
        const a = document.createElement("a");
        const linkText = document.createTextNode("Download File");
        const filename = 'Failed_Applications.xlsx';
        a.appendChild(linkText);
        a.setAttribute('download',filename);
        a.href = url;
        a.click();
        a.remove();
      },
      error: err => {
        console.log(err);
        alert('Something went wrong!');
      }
    })
  }

}
