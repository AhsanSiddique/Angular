import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BulkRegistrationService, EPackageUploadZip } from '@fan-id/api/server';
import { downloadFile } from '@fan-id/shared/utils/common';
import { registrationTypes } from './registration-types';

enum ERegistrationType {
  manual = 'manual',
  packageUpload = 'packageUpload'
}

const registrationPaths = {
  [ERegistrationType.manual]: 'manual-registration/step-1',
  [ERegistrationType.packageUpload]: 'package-upload/step-1'
}

@Component({
  selector: 'fan-id-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {

  selectedOption = 'manual';
  showApiSyncPopup = false;
  registrationTypes = registrationTypes;
  EPackageTypes = EPackageUploadZip;
  ERegistrationType = ERegistrationType;
  constructor(private router: Router, private bulkService: BulkRegistrationService) { }

  // toggle registration option
  registerOptions(option: ERegistrationType) {
    // this.selectedOption = option;
    this.redirectTo(registrationPaths[option]);
  }

  //Router redirection
  redirectTo(path){
    this.router.navigate(['/main/bulk-registration/'+path]);
  }

  closeApiSync(){
    this.showApiSyncPopup=false;
  }

  exportTemplate() {
    this.bulkService.exportTemplate().subscribe(data=>{
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "BulkRegistration_Template.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  downloadPackageTemplate(package_type: EPackageUploadZip) {
    this.bulkService.getPackageTemplate(package_type).subscribe(
      {
        next: data => {
          downloadFile({
            data,
            filename: EPackageUploadZip[package_type] + '.zip',
            type: 'application/zip'
          });
        },
        error: error => {
          console.log(error);
          alert('Error downloading file. Please try again.');
        },
        complete: () => {
          console.log('File downloaded successfully.');
        }
      }
    )
  }

}
