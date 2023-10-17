import { Component, OnInit } from '@angular/core';
import { first, tap } from 'rxjs/operators';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {
  BulkRegistrationService,
  MetadataService,
  UploadExcelwithData,
  MetaDataLookup,
  MetadataParams,
  NationalityLookup,
} from '@fan-id/api/server';
import { Router } from '@angular/router';
import { LanguageService, MenuService } from '@fan-id/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'fan-id-bulk-upload-step1',
  templateUrl: './bulk-upload-step1.component.html',
  styleUrls: ['./bulk-upload-step1.component.scss'],
})
export class BulkUploadStep1Component implements OnInit {
  registrationForm: FormGroup;
  load: boolean = false;
  showError: boolean;
  error = '';
  file: File;
  minfileSize: any = '';
  maxfileSize: any = '';
  fileType: any = '';
  deliveryType: any;
  events: any;
  organizations: any;
  servicecentres: any;
  eventName: any = '';
  displayEventName;

  userOrganizationId: number = 0;
  eventSelecetd: any;
  eventCode: string;
  validatebgError: boolean;
  show_cancel_modal: boolean;
  metaDataLookupParam: MetadataParams = {};
  delivery_types: any[];
  isRTLLayout: boolean;

  constructor(
    private fb: FormBuilder,
    private bulkService: BulkRegistrationService,
    private menuService: MenuService,
    private router: Router,
    private metadataService: MetadataService,
    private language: LanguageService
  ) {}

  ngOnInit(): void {
    this.eventName = localStorage.getItem('event');
    this.displayEventName = localStorage.getItem('displayEvent');
    this.eventCode = localStorage.getItem('eventCode');
    this.userOrganizationId = parseInt(localStorage.getItem('organizationId'));
    this.eventSelecetd = this.menuService.getSelectedEvent();
    this.validatebgError = false;
    this.load = false;
    this.registrationForm = this.fb.group({
      eventname: null,
      organizationname: [null, Validators.required],
      bulkgroupname: ['', Validators.required],
      uploadzipfile: [null, Validators.required],
      deliverytype: [null],
      servicecentre: null,
      accodetails:['',Validators.required]
    });
    this.language.layout.subscribe((isRTL) => {
      this.isRTLLayout = isRTL;
    });

    this.registrationForm.controls['eventname'].patchValue(this.eventSelecetd); //mock for event preselect

    this.bulkService
      .getEvents()
      .pipe(first())
      .subscribe(
        (data: any) => {
          this.events = data.dataList;
          // this.registrationForm.patchValue({ eventname: this.eventName });
        },
        (error) => console.error(error)
      );

    this.bulkService
      .getOrganizations()
      .pipe(first())
      .subscribe(
        (data: any) => {
          this.organizations = data.dataList;
          this.registrationForm.patchValue({
            organizationname: this.userOrganizationId,
          });
        },
        (error) => console.error(error)
      );

    this.bulkService
      .getServicecentres()
      .pipe(first())
      .subscribe(
        (data: any) => {
          this.servicecentres = data?.dataList.filter(
            (x) => x.isEnabled === true
          );
        },
        (error) => console.error(error)
      );

    this.metadataService
      .getDeliveryTypes(this.metaDataLookupParam)
      .subscribe((response) => {
        this.delivery_types = response;
        this.registrationForm.patchValue({ deliverytype: 'DHC' });//Scp for Service Center pickup
        this.registrationForm.controls.deliverytype.disable();
      });
    console.log(this.deliveryType);
  }

  uploadfile(args) {
    this.file = null;

    if (args.target.files && args.target.files.length) {
      this.file = <File>args.target.files[0];

      if (
        this.file.type === 'application/zip' ||
        this.file.type === 'application/x-zip-compressed' ||
        this.file.type === 'application/octet-stream' ||
        this.file.type === 'application/x-zip'
      ) {
        this.fileType = null;
      } else {
        this.fileType = this.file.name;
        this.registrationForm.controls.uploadzipfile.reset();
        this.file = null;
      }
    }
  }

  filereset() {
    this.registrationForm.controls.uploadzipfile.reset();
    this.file = null;
  }

  changeDeliveryType(args) {
    this.deliveryType = args;
    if (this.deliveryType === 'pickup') {
      this.registrationForm
        .get('servicecentre')
        .setValidators([Validators.required]);
    }
    if (this.deliveryType === 'delivery') {
      this.registrationForm.controls.servicecentre.setValue(null);
      this.registrationForm.get('servicecentre').setValidators(null);
    }
    this.registrationForm.get('servicecentre').updateValueAndValidity();
  }

  onSubmit() {
    this.load = true;
    if (this.registrationForm.valid) {
      const payload: UploadExcelwithData = {
        RefEvent_Code: this.menuService.getSelectedEventCode(),
        RefCardDeliveryType_Code: this.registrationForm.get('deliverytype')
          .value,
        RefSerivceCenter_Code: this.registrationForm.get('servicecentre').value,
        DocSubType: '(binary)',
        RefOrganization_Id: this.userOrganizationId,
        BulkGroupName: this.registrationForm.get('bulkgroupname').value,
        Channel: 8,
        DeliveryAddress: '',
        RefSystemUser_Id: '3',
        file: this.file,
        OrgGroupAccommodationAddress:this.registrationForm.get('accodetails').value
      };
      this.bulkService
        .postExcelwithdata(payload)
        .pipe(first())
        .subscribe(
          (response) => {
            if (response.status === 200) {
              const selectedDeliveryType = this.delivery_types.find(
                (elem) =>
                  elem.code === this.registrationForm.get('deliverytype').value
              );
              const selectedServiceCentere = this.servicecentres.find(
                (elem) =>
                  elem.code === this.registrationForm.get('servicecentre').value
              );
              const organizationId = this.organizations.find(
                (elem) => elem.id === this.userOrganizationId
              );
              const selectedPayload = {
                selectedDeliveryType: selectedDeliveryType,
                selectedServiceCentere: selectedServiceCentere,
                organizationId: organizationId,
                fileName: this.file.name,
              };
              const data = response.data;
              if (data != null && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                  data[i].uiId = i + 1;
                  data[i].isQidCallDone = false;
                }
              }

              let state = {
                formData: payload,
                dataList: data,
                selectedPayload: selectedPayload,
                maxBulkApplicationSize: response.maxNumberApplication,
              };
              localStorage.setItem(
                'maxBulkApplicationSize',
                response?.maxNumberApplication
              );
              localStorage.setItem('bulkItem', JSON.stringify(state));
              state['previousPage'] = 'bulk-upload';
              localStorage.setItem("ShowExport","false");

              this.router.navigate(['/main/bulk-registration/upload/step-2'], {
                state,
              });
            } else {
              this.error == 'Somehing went Wrong';
              this.showError = true;
            }

            // if (success) {
            //   setTimeout(() => {
            //     this.load = false;
            //
            //   }, 500);
            // }
          },
          (error) => {
            this.load = false;
            console.log(error);
            this.error = 'Something went wrong, please try again.';
            this.showError = true;
          }
        );
    } else {
      this.load = false;
    }
  }
  onErrorClose() {
    this.error = '';
    this.showError = false;
  }

  validateBulkGroup() {
    const bgName = this.registrationForm.get('bulkgroupname').value;
    const payload = {
      refOrganization_Id: this.userOrganizationId,
      bulkGroupName: bgName,
      refTournament_Code: this.eventCode,
    };
    if (bgName != '' && bgName !== null) {
      this.bulkService.validateBulkGroupName(payload).subscribe(
        (response) => {
          if (response['message'] === null) {
            this.validatebgError = false;
          } else {
            this.validatebgError = true;
            this.registrationForm.controls['bulkgroupname'].setErrors({
              incorrect: true,
            });
            this.registrationForm.controls[
              'bulkgroupname'
            ].updateValueAndValidity();
          }
        },
        (error) => {
          this.validatebgError = true;
          this.registrationForm.controls[
            'bulkgroupname'
          ].updateValueAndValidity();
        }
      );
    }
  }
  cancel() {
    this.router.navigate(['/main/bulk-registration']);
  }
}
