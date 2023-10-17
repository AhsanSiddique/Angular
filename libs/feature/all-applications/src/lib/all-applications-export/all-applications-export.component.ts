import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApplicantService, BulkGroupService, CustomerCardApplicationAllListRequest, CustomerCardApplicationCardListRequest, MetadataService, NationalityLookup } from '@fan-id/api/server';
import { MenuService } from '@fan-id/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'fan-id-all-applications-export',
  templateUrl: './all-applications-export.component.html',
  styleUrls: ['./all-applications-export.component.scss'],
})
export class AllApplicationsExportComponent implements OnInit {
  @Output() closeThis = new EventEmitter();
  @Input() isServiceCenter = true;
  exportForm:FormGroup;
  translateKey = 'AllApplicationsExport';

  cardStatusList = [
    { name: 'All', value: -1 },
    { name: 'Pending for Printing', value: 1 },
    { name: 'Printed', value: 2 },
    { name: 'Ready For Collection', value: 4 },
    { name: 'Collected by Fan', value: 5 },
    { name: 'Home Delivery', value: 10 },
    { name: 'Ready for Collection (QPR)', value: 11 },
    { name: 'In Printing Queue', value: 12}
  ];
  ApplicationStatusNameList = [
    { name: 'All', value: -1 },
    { name: 'Pending', value:1 },
    { name: 'Approved', value: 2 },
    { name: 'Rejected', value: 3 },
    { name: 'Data Error', value: 4 },
    { name: 'Cancelled', value: 6 }
  ];
  organizationList = [
    { name: 'All', id: -1 }
  ];
  dateToday!: NgbDateStruct;
  nationalityList$!: Observable<NationalityLookup[]>;
  hayyaVisitCategoryList$!: Observable<{ name: string, value: number }[]>;

  constructor(
    private fb: FormBuilder,
    private menuService: MenuService,
    private applicantService: ApplicantService,
    private bulkService: BulkGroupService,
    private metadataService: MetadataService
  ) {
    const today = new Date();
    this.dateToday = {
      year: today.getFullYear(),
      month: today.getMonth()+1,
      day: today.getDate(),
    };
  }

  ngOnInit() {
    if (this.isServiceCenter) {
      this.exportForm = this.fb.group({
        applicationDateBegin: [null, [Validators.required]],
        applicationDateEnd: [null, [Validators.required]],
        applicationStatus: [null, [Validators.required]],
        // cardStatus: [null, [Validators.required]],
        TournamentCode: [null, [Validators.required]],
        serviceCentreCode: [null],
        moiErrorCode: [null],
        inAnyNationalityCodes: [null],
        inAnyCustomerCategoryCodes: [null],
      });
    } else {
      this.exportForm = this.fb.group({
        applicationDateBegin: [null, [Validators.required]],
        applicationDateEnd: [null, [Validators.required]],
        applicationStatus: [null, [Validators.required]],
        inAnyRefOrganization_Id: [null, [Validators.required]],
        TournamentCode: [null, [Validators.required]],
        serviceCentreCode: [null],
      });
      this.ApplicationStatusNameList = [
        ...this.ApplicationStatusNameList,
        { name: 'Draft', value: 0 },
      ]
    }
    const tournamentCode = this.menuService.getSelectedEventCode();
    const serviceCentreCode = this.menuService.getTerminalCode();
    this.ef.TournamentCode.patchValue(tournamentCode);
    this.ef.serviceCentreCode.patchValue(serviceCentreCode);
  }

  get ef() {
    return this.exportForm.controls;
  }

  generateExcel() {
    this.isServiceCenter ? this.generateExcelSC() : this.generateExcelBR();
  }

  generateExcelSC() {
    if(this.exportForm.invalid) return;
    const body = this.exportForm.value as CustomerCardApplicationAllListRequest;
    const {
      applicationDateBegin,
      applicationDateEnd,
      TournamentCode,
      applicationStatus,
      moiErrorCode,
    } = body;
    let nationalityCode = body.inAnyNationalityCodes as unknown as string;
    nationalityCode = nationalityCode === '_ALL' ? null : nationalityCode;
    let hayyaVisitCategoryCode = body.inAnyCustomerCategoryCodes as unknown as string;
    hayyaVisitCategoryCode = hayyaVisitCategoryCode === '_ALL' ? null : hayyaVisitCategoryCode;
    const _body: CustomerCardApplicationAllListRequest = {
      applicationDateBegin,
      applicationDateEnd,
      TournamentCode,
      ...(applicationStatus !== -1 && { applicationStatus }),
      // ...(cardStatus !== -1 && { cardStatus }),
      ...(moiErrorCode && { moiErrorCode: `#${moiErrorCode}#` }),
      // multi-select compatible field used for single select
      ...(nationalityCode && { inAnyNationalityCodes: [nationalityCode] }),
      ...(hayyaVisitCategoryCode && { inAnyCustomerCategoryCodes: [hayyaVisitCategoryCode] }),
    }
    // console.log(_body);
    this.applicantService.generateExcelAllList(_body)
      .subscribe(blob => {
        this.downloadExcel({blob, body});
        this.closeThis.emit('close')
      }, err => {
        console.log({err});
        alert('Something went wrong!');
      })
  }

  generateExcelBR() {
    if(this.exportForm.invalid) return;
    const _body = this.exportForm.value as CustomerCardApplicationAllListRequest;
    const { applicationDateBegin, applicationDateEnd, TournamentCode, applicationStatus, inAnyRefOrganization_Id } = _body;
    const body: CustomerCardApplicationAllListRequest = {
      applicationDateBegin,
      applicationDateEnd,
      TournamentCode,
      includeDraft:(applicationStatus === 0 || applicationStatus === -1)?true:false,
      ...(applicationStatus !== -1 && {applicationStatus}),
      ...(inAnyRefOrganization_Id !== -1 && {inAnyRefOrganization_Id: [inAnyRefOrganization_Id as number]}),
      channel: 8
    }

    console.log(body);
    this.applicantService.generateExcelAllList(body)
    .pipe(take(1))
    .subscribe(blob => {
      this.downloadExcel({blob, body});
      this.closeThis.emit('close')
    }, err => {
      console.log({err});
      alert('Something went wrong!');
    })
  }

  downloadExcel({blob, body}: {blob: Blob, body: CustomerCardApplicationCardListRequest}) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    const linkText = document.createTextNode("Download File");
    const filename = `CardApplications_${body.applicationDateBegin}_${body.applicationDateEnd}.xlsx`
    a.appendChild(linkText);
    a.setAttribute('download',filename);
    a.href = url;
    a.click();
    a.remove();
  }
}
