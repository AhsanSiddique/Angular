import { HttpHeaders } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CoreService } from '@fan-id/core';
import { downloadFile } from '@fan-id/shared/utils/common';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'fan-id-pdf-modal',
  templateUrl: './pdf-modal.component.html',
  styleUrls: ['./pdf-modal.component.scss']
})
export class PdfModalComponent {
  @Input() pdfSrc = '';
  @Input() isDownloadable = false;
  @Output() closeThis = new EventEmitter();
  pdf_zoom = 1;
  pdf_rotate = 0;
  pdf_transform_origin = 'center';
  token: string;
  httpHeaders: any;

  constructor(
    private spinner: NgxSpinnerService,
    private coreService: CoreService
  ) {
    this.spinner.show('pdf-viewer');
    this.token = JSON.parse(this.coreService.decryptValue(localStorage.getItem('accessToken')));
    this.httpHeaders = { Authorization: 'Bearer ' + this.token, 'Access-Control-Allow-Origin': '*', content_type: 'application/json' };
  }
 
  zoomIn() {
    this.pdf_zoom = +(this.pdf_zoom + 0.1).toFixed(2);
  }

  zoomOut() {
    if (this.pdf_zoom === 0.1) return;
    this.pdf_zoom = +(this.pdf_zoom - 0.1).toFixed(2);
  }

  rotateClockWise() {
    this.pdf_rotate += 90;
  }

  rotateAntiClockWise() {
    this.pdf_rotate -= 90;
  }

  callBackFn(event) {
    this.spinner.hide('pdf-viewer')
  }

  onError(error: any) {
    console.log(error);
    alert('Something went wrong!');
    this.closeThis.emit('close');
  }

  downloadPdf() {
    const urlToDownload = this.pdfSrc;
    this.spinner.show('pdf-viewer');
    fetch(urlToDownload)
      .then((res) => res.blob())
      .then((blob) => {
        downloadFile({ data: blob, type: 'application/pdf', filename: 'entry-permit.pdf' });
        this.spinner.hide('pdf-viewer');
      })
      .catch((err) => {
        console.log(err);
        this.spinner.hide('pdf-viewer');
        alert('Something went wrong!');
      });
  }
}
