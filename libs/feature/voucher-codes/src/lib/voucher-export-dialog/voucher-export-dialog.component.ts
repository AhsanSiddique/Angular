import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BulkGroupService, VoucherCodeListRequest, VoucherService } from '@fan-id/api/server';
import { convertNgbDateToDDMMYYYY } from '@fan-id/shared/utils/date';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { take } from 'rxjs/operators';

@Component({
  selector: 'fan-id-voucher-export-dialog',
  templateUrl: './voucher-export-dialog.component.html',
  styleUrls: ['./voucher-export-dialog.component.scss']
})
export class VoucherExportDialogComponent implements OnInit {
  @Input() title ='';
  @Input() userAgent = false;
  @Input() type = 0;
  @Output() closeThis = new EventEmitter();

  exportForm!: FormGroup;
  translateKey = 'AllApplicationsExport';//chnage
  organizationList =[{ name: 'All', organizationId: -1 }]
  voucherGroupList =[{ bulkGroupName: 'All' }]
  dateToday!: NgbDateStruct;
  organization_Id:any;
  constructor(private fb: FormBuilder,
      private bulkService: BulkGroupService,
      private vs:VoucherService) {
        const today = new Date();
        this.dateToday = {
          year: today.getFullYear(),
          month: today.getMonth()+1,
          day: today.getDate(),
        };
        this.organization_Id = localStorage.getItem('organizationId');
   }

  ngOnInit() {
    this.getOrganizationList();
    this.getvoucherGroupList();
    if (this.userAgent) {
      this.exportForm = this.fb.group({
        applicationDateBegin: [null, [Validators.required]],
        applicationDateEnd: [null, [Validators.required]],
        organization_Name: [null, [Validators.required]],
        bulkGroup_Name:[null,[Validators.required]]
      });
    } else {
      this.exportForm = this.fb.group({
        applicationDateBegin: [null, [Validators.required]],
        applicationDateEnd: [null, [Validators.required]],
        bulkGroup_Name:[null,[Validators.required]]
      });
    }
  }

  get ef() {
    return this.exportForm.controls;
  }

  getOrganizationList() {
    this.bulkService.getOrganizations()
      .pipe(take(1))
      .subscribe(res => {
        const dataList = res?.dataList ?? [];
        this.organizationList =
          [...this.organizationList, ...dataList];
      }, err => {
        console.log({ err });
      })
  }

  getvoucherGroupList(selectorg:boolean = false){
    let superadmin:boolean = true;
    if(!this.userAgent || selectorg === true){
      superadmin = false;
    }
    this.voucherGroupList =[]
    this.vs.voucherGroupNameList(this.organization_Id,superadmin)
    .pipe(take(1)).subscribe(response=>{
      const list = response?.dataList ?? [];
      if(list.length){
        this.voucherGroupList = [{ bulkGroupName: 'All' }, ...list]
      }
    }, err => {
      console.log({ err });
    })
  }

  generateExcel() {
    if (this.exportForm.invalid) return;
    const body = this.exportForm.value;
    body.applicationDateBegin = convertNgbDateToDDMMYYYY(body.applicationDateBegin as unknown as NgbDateStruct)
    body.applicationDateEnd = convertNgbDateToDDMMYYYY(body.applicationDateEnd as unknown as NgbDateStruct)
    console.log(JSON.stringify(body));
    if (this.type === 1) {
      if(this.userAgent) {
        const organization: any = this.organizationList.find((item: any) => item.organizationId === body.organization_Name);
        organization?.organizationId !== -1 && (body.InAnyVoucherOrganization_Id = [organization?.id]);
      } else {
        body.InAnyVoucherOrganization_Id = [this.organization_Id];
        //add bulk group name
      }
      
      const vouchergroup: any = this.voucherGroupList.find((item:any) => item.bulkGroupName === body.bulkGroup_Name)
      vouchergroup?.bulkGroupName !=='All' && (body.BulkVoucherGroupName = vouchergroup?.bulkGroupName);

      delete body.organization_Name;
      delete body.bulkGroup_Name;
      this.vs.generateVoucherCodeListExcel(body)
      .pipe(take(1))
      .subscribe(blob => {
        this.downloadExcel({blob, body});
        this.closeThis.emit('close')
      }, err => {
        console.log({err});
        alert('Something went wrong!');
      })
    } else if (this.type === 2) {
      body.voucherDateBegin = body.applicationDateBegin;
      body.voucherDateEnd = body.applicationDateEnd;
      body.bulkGroup_Name !== 'All' && (body.BulkVoucherGroupName  = body.bulkGroup_Name);
      delete body.applicationDateBegin;
      delete body.applicationDateEnd;
      delete body.bulkGroup_Name;
      if(!this.userAgent) {
        body.OrganizationId = localStorage.getItem('organizationCode');
      } else {
        body.organization_Name !== -1 && (body.OrganizationId = body.organization_Name);
        delete body.organization_Name;
      }
      this.vs.DownloadVouchersExcel(body)
        .pipe(take(1))
        .subscribe(blob => {
          this.downloadExcel({ blob, body });
          this.closeThis.emit('close')
        }, err => {
          console.log({ err });
          alert('Something went wrong!');
        })
    } else {
      alert('Something went wrong!');
    }
  }

  downloadExcel({blob, body}: {blob: Blob, body: VoucherCodeListRequest}) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    const linkText = document.createTextNode("Download File");
    const filename = this.type === 1 ? 'VoucherCodeApplications.xlsx' : 'VoucherCodes.xlsx';
    a.appendChild(linkText);
    a.setAttribute('download',filename);
    a.href = url;
    a.click();
    a.remove();
  }

  organizationChange(event:any){
    this.exportForm.controls.bulkGroup_Name.patchValue(null);
    if(event.organizationId === -1){
      this.organization_Id = localStorage.getItem('organizationId');
      this.getvoucherGroupList(false);
    }
    else{
      this.organization_Id = event.id
      this.getvoucherGroupList(true);
    }
  }
}
