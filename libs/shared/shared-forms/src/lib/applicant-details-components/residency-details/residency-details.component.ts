import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ApplicantService } from '@fan-id/api/server';
import { BehaviorSubject } from 'rxjs';
import { ApplicantDataInput } from '../../base-classes';

@Component({
  selector: 'fan-id-residency-details',
  templateUrl: './residency-details.component.html',
  styleUrls: ['./residency-details.component.scss']
})
export class ResidencyDetailsComponent extends ApplicantDataInput {
  viewDocument$ = new BehaviorSubject<{ hasDocument: boolean, documentSrc: string }>(
    { hasDocument: false, documentSrc: '' }
  );
  constructor(
    private applicantService: ApplicantService,
    private sanitizer: DomSanitizer
  ) {
    super();
  }

  viewDocument(imagePath: string) {
    const imageURL = this.applicantService.composeImageUrl(imagePath);
    this.applicantService.getImageBlob(imageURL).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const documentSrc = this.sanitizer.bypassSecurityTrustUrl(url) as string;
        this.viewDocument$.next({ hasDocument: true, documentSrc });
      },
      error: (error) => {
        console.log({ error });
        this.viewDocument$.next({ hasDocument: false, documentSrc: '' });
        window.alert('image error.')
      }
    })
  }
}
