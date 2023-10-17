import { Component, Input } from '@angular/core';
import { ApplicantDataInput } from '../../base-classes';
import { ApplicantService, TICAODocumentInformation, TournamentType } from '@fan-id/api/server';
import { take } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'fan-id-document-details',
  templateUrl: './document-details.component.html',
  styleUrls: ['./document-details.component.scss'],
})
export class DocumentDetailsComponent extends ApplicantDataInput {
  @Input() viewDocument? = false;
  @Input() showICAO = false;
  @Input() icao_data: TICAODocumentInformation;
  eventTournamentType:TournamentType = 2;
  documentImageSrc: string | null = null;
  showImageModal = false;
  icao_expanded = false;
  
  constructor(private applicantService: ApplicantService, private sanitizer: DomSanitizer) {
    super();
    this.eventTournamentType = parseInt(localStorage.getItem('eventType')) as TournamentType;
  }

  downloadDocument(imageURL: string, showImage = false) {
    this.applicantService.getImageBlob(imageURL)
    .pipe(take(1))
    .subscribe(blob => {
      // saveAs(blob, 'download.png')
      const url = window.URL.createObjectURL(blob);
      if (!showImage) {
        const a = document.createElement("a");
        const linkText = document.createTextNode("View File");
        a.target = "_blank";
        a.appendChild(linkText);
        a.href = url;
        a.click();
        a.remove();
      } else {
        this.documentImageSrc = this.sanitizer.bypassSecurityTrustUrl(url) as string;
        this.showImageModal = true;
      }
    },
    error => {
      console.log({ error });
      window.alert('image error.')
    })
  }

  closeImageModal() {
    this.showImageModal = false;
    this.documentImageSrc = null;
  }

  collapseICAOTable() {
    this.icao_expanded = false;
    document.querySelector('.document-information').scrollIntoView(
      { behavior: 'smooth', block: 'start', inline: 'start' }
    );
  }
}
